import { Router } from 'express';
import supabase from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { updateOrderStatus } from '../services/orderService.js';

const router = Router();

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key';

// Admin auth: accept either JWT (admin role) or X-Admin-Key header
router.use((req, res, next) => {
  const apiKey = req.headers['x-admin-key'];
  if (apiKey && apiKey === ADMIN_API_KEY) {
    return next();
  }
  // Fall back to JWT auth
  authenticateUser(req, res, (err) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    requireRole('admin')(req, res, next);
  });
});

// GET /api/admin/users — List all users (from user_info + auth emails)
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;

    let query = supabase
      .from('user_info')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Admin users fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Fetch auth users to get emails
    let users = data || [];
    try {
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUsers = authData?.users || [];
      // Build map: db_id → auth user info
      const authMap = {};
      for (const au of authUsers) {
        const dbId = au.user_metadata?.db_id;
        if (dbId && au.user_metadata?.role !== 'vendor') {
          authMap[dbId] = { email: au.email, provider: au.app_metadata?.provider || 'email' };
        }
      }
      users = users.map(u => ({ ...u, ...authMap[u.id] }));
    } catch (authErr) {
      console.error('Auth users fetch error:', authErr);
    }

    res.json({ users });
  } catch (err) {
    console.error('Admin users route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/vendors — List all vendors (from vendor_info)
router.get('/vendors', async (req, res) => {
  try {
    const { search } = req.query;

    let query = supabase
      .from('vendor_info')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Admin vendors fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch vendors' });
    }

    // Attach customer count per vendor
    let vendors = data || [];
    if (vendors.length > 0) {
      const vendorIds = vendors.map(v => v.id);
      const { data: customers } = await supabase
        .from('user_info')
        .select('vendor_id')
        .in('vendor_id', vendorIds);

      const countMap = {};
      for (const c of (customers || [])) {
        if (c.vendor_id) {
          countMap[c.vendor_id] = (countMap[c.vendor_id] || 0) + 1;
        }
      }
      vendors = vendors.map(v => ({ ...v, customer_count: countMap[v.id] || 0 }));
    }

    res.json({ vendors });
  } catch (err) {
    console.error('Admin vendors route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users/:id — Single user detail
router.get('/users/:id', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('user_info')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get auth info (email, provider)
    try {
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUsers = authData?.users || [];
      const authUser = authUsers.find(au => au.user_metadata?.db_id === user.id);
      if (authUser) {
        user.email = authUser.email;
        user.provider = authUser.app_metadata?.provider || 'email';
      }
    } catch (authErr) {
      console.error('Auth fetch error:', authErr);
    }

    // Parallel fetch: orders, addresses, linked vendor
    const [ordersRes, addressesRes, vendorRes] = await Promise.all([
      supabase.from('order_info').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('customer_addresses').select('*').eq('user_id', user.id),
      user.vendor_id
        ? supabase.from('vendor_info').select('*').eq('id', user.vendor_id).single()
        : Promise.resolve({ data: null }),
    ]);

    let orders = ordersRes.data || [];

    // Attach order_items
    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: items } = await supabase.from('order_items').select('*').in('order_id', orderIds);
      const itemsByOrder = {};
      for (const item of (items || [])) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      }
      orders = orders.map(o => ({ ...o, order_items: itemsByOrder[o.id] || [] }));
    }

    // Stats
    const nonCancelled = orders.filter(o => o.status !== 'cancelled');
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalSpent = nonCancelled.reduce((sum, o) => sum + (Number(o.total_amt) || 0), 0);
    const totalCommission = deliveredOrders.reduce((sum, o) => sum + (Number(o.commission_amt) || 0), 0);
    const stats = {
      total_orders: orders.length,
      total_spent: totalSpent,
      total_commission: totalCommission,
      platform_net: totalCommission,
    };

    res.json({
      user,
      vendor: vendorRes.data || null,
      orders,
      addresses: addressesRes.data || [],
      stats,
    });
  } catch (err) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id — Remove a customer
router.delete('/users/:id', async (req, res) => {
  try {
    // Fetch user to get auth_id
    const { data: user, error: fetchError } = await supabase
      .from('user_info')
      .select('id, auth_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete profile row (cascades to customer_addresses, order_info, etc.)
    const { error: deleteError } = await supabase
      .from('user_info')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      console.error('User delete error:', deleteError);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    // Delete from Supabase Auth
    if (user.auth_id) {
      await supabase.auth.admin.deleteUser(user.auth_id);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/vendors/:id — Single vendor detail
router.get('/vendors/:id', async (req, res) => {
  try {
    const { data: vendor, error } = await supabase
      .from('vendor_info')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Parallel fetch: products, orders, customers
    const [productsRes, ordersRes, customersRes] = await Promise.all([
      supabase.from('product_info').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false }),
      supabase.from('order_info').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false }),
      supabase.from('user_info').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false }),
    ]);

    let orders = ordersRes.data || [];

    // Attach user info and order_items
    if (orders.length > 0) {
      const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
      const orderIds = orders.map(o => o.id);

      const [usersRes, itemsRes] = await Promise.all([
        userIds.length > 0
          ? supabase.from('user_info').select('id, name').in('id', userIds)
          : { data: [] },
        supabase.from('order_items').select('*').in('order_id', orderIds),
      ]);

      const usersMap = {};
      for (const u of (usersRes.data || [])) usersMap[u.id] = u;

      const itemsByOrder = {};
      for (const item of (itemsRes.data || [])) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      }

      orders = orders.map(o => ({
        ...o,
        user: usersMap[o.user_id] || null,
        order_items: itemsByOrder[o.id] || [],
      }));
    }

    const products = productsRes.data || [];
    const customers = customersRes.data || [];

    // Stats
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amt) || 0), 0);
    const totalCommission = deliveredOrders.reduce((sum, o) => sum + (Number(o.commission_amt) || 0), 0);
    const stats = {
      total_products: products.length,
      total_orders: orders.length,
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      vendor_net: totalRevenue - totalCommission,
      total_customers: customers.length,
    };

    res.json({ vendor, products, orders, customers, stats });
  } catch (err) {
    console.error('Admin vendor detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/vendors/:id/commission — Set vendor commission rate
router.put('/vendors/:id/commission', async (req, res) => {
  try {
    const { commission_rate } = req.body;
    const rate = Number(commission_rate);

    if (isNaN(rate) || rate < 0 || rate > 100) {
      return res.status(400).json({ error: 'commission_rate must be between 0 and 100' });
    }

    const { data, error } = await supabase
      .from('vendor_info')
      .update({ commission_rate: rate })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ vendor: data });
  } catch (err) {
    console.error('Admin set commission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/vendors/:id — Remove a vendor
router.delete('/vendors/:id', async (req, res) => {
  try {
    // Fetch vendor to get auth_id
    const { data: vendor, error: fetchError } = await supabase
      .from('vendor_info')
      .select('id, auth_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Unlink customers from this vendor
    await supabase
      .from('user_info')
      .update({ vendor_id: null })
      .eq('vendor_id', vendor.id);

    // Delete profile row (cascades to product_info, etc.)
    const { error: deleteError } = await supabase
      .from('vendor_info')
      .delete()
      .eq('id', vendor.id);

    if (deleteError) {
      console.error('Vendor delete error:', deleteError);
      return res.status(500).json({ error: 'Failed to delete vendor' });
    }

    // Delete from Supabase Auth
    if (vendor.auth_id) {
      await supabase.auth.admin.deleteUser(vendor.auth_id);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete vendor error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/orders — All platform orders (with date/search filters)
router.get('/orders', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, from, to, search } = req.query;

    // If search is provided, find matching user IDs first
    let searchUserIds = null;
    if (search) {
      const { data: matchedUsers } = await supabase
        .from('user_info')
        .select('id')
        .ilike('name', `%${search}%`);
      searchUserIds = (matchedUsers || []).map(u => u.id);
    }

    let query = supabase
      .from('order_info')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) query = query.eq('status', status);
    if (from) query = query.gte('created_at', `${from}T00:00:00`);
    if (to) query = query.lte('created_at', `${to}T23:59:59`);
    if (searchUserIds !== null) {
      if (searchUserIds.length === 0) {
        return res.json({ orders: [] });
      }
      query = query.in('user_id', searchUserIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Admin orders fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    let orders = data || [];

    // Attach user info and order items
    if (orders.length > 0) {
      const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
      const orderIds = orders.map(o => o.id);

      const [usersRes, itemsRes] = await Promise.all([
        userIds.length > 0
          ? supabase.from('user_info').select('id, name').in('id', userIds)
          : { data: [] },
        supabase.from('order_items').select('*').in('order_id', orderIds),
      ]);

      const usersMap = {};
      for (const u of (usersRes.data || [])) usersMap[u.id] = u;

      const itemsByOrder = {};
      for (const item of (itemsRes.data || [])) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      }

      orders = orders.map(o => ({
        ...o,
        user: usersMap[o.user_id] || null,
        order_items: itemsByOrder[o.id] || [],
      }));
    }

    res.json({ orders });
  } catch (err) {
    console.error('Admin orders route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/analytics/detailed — Rich analytics with date range
router.get('/analytics/detailed', async (req, res) => {
  try {
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 29);

    const from = req.query.from || defaultFrom.toISOString().split('T')[0];
    const to = req.query.to || now.toISOString().split('T')[0];
    const fromTS = `${from}T00:00:00`;
    const toTS = `${to}T23:59:59`;

    // Parallel fetch all data
    const [ordersRes, allOrderItemsRes, productsRes, vendorsRes, usersRes, totalUsersRes, totalVendorsRes] = await Promise.all([
      supabase.from('order_info').select('*').gte('created_at', fromTS).lte('created_at', toTS).order('created_at', { ascending: false }),
      supabase.from('order_items').select('*'),
      supabase.from('product_info').select('id, name, category'),
      supabase.from('vendor_info').select('id, name'),
      supabase.from('user_info').select('id, name, created_at'),
      supabase.from('user_info').select('id', { count: 'exact', head: true }),
      supabase.from('vendor_info').select('id', { count: 'exact', head: true }),
    ]);

    const orders = ordersRes.data || [];
    const allItems = allOrderItemsRes.data || [];
    const products = productsRes.data || [];
    const vendors = vendorsRes.data || [];
    const users = usersRes.data || [];

    // Build lookup maps
    const productMap = {};
    for (const p of products) productMap[p.id] = p;
    const vendorMap = {};
    for (const v of vendors) vendorMap[v.id] = v;

    // Order IDs in range
    const orderIdSet = new Set(orders.map(o => o.id));
    const rangeItems = allItems.filter(item => orderIdSet.has(item.order_id));

    // Summary
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amt) || 0), 0);
    const totalCommission = deliveredOrders.reduce((sum, o) => sum + (Number(o.commission_amt) || 0), 0);
    const ordersByStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    const newUsersInRange = users.filter(u => u.created_at >= fromTS && u.created_at <= toTS);

    const summary = {
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      total_orders: orders.length,
      total_users: totalUsersRes.count || 0,
      total_vendors: totalVendorsRes.count || 0,
      avg_order_value: orders.length > 0 ? totalRevenue / orders.length : 0,
      new_customers: newUsersInRange.length,
      orders_by_status: ordersByStatus,
    };

    // Daily revenue
    const dailyMap = {};
    for (const o of orders) {
      const day = o.created_at?.split('T')[0];
      if (!day) continue;
      if (!dailyMap[day]) dailyMap[day] = { date: day, revenue: 0, order_count: 0 };
      dailyMap[day].order_count++;
      if (o.status === 'delivered') dailyMap[day].revenue += Number(o.total_amt) || 0;
    }
    const daily_revenue = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Monthly revenue
    const monthlyMap = {};
    for (const o of orders) {
      const month = o.created_at?.substring(0, 7);
      if (!month) continue;
      if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, order_count: 0 };
      monthlyMap[month].order_count++;
      if (o.status === 'delivered') monthlyMap[month].revenue += Number(o.total_amt) || 0;
    }
    const monthly_revenue = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // Top products by qty
    const productQty = {};
    for (const item of rangeItems) {
      const pid = item.product_id;
      if (!productQty[pid]) productQty[pid] = { qty_sold: 0, revenue: 0 };
      productQty[pid].qty_sold += Number(item.quantity) || 1;
      productQty[pid].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }
    const top_products = Object.entries(productQty)
      .map(([pid, d]) => ({
        id: pid,
        name: productMap[pid]?.name || 'Unknown',
        category: productMap[pid]?.category || 'other',
        qty_sold: d.qty_sold,
        revenue: d.revenue,
      }))
      .sort((a, b) => b.qty_sold - a.qty_sold)
      .slice(0, 5);

    // Top vendors by revenue
    const vendorRev = {};
    for (const o of deliveredOrders) {
      const vid = o.vendor_id;
      if (!vid) continue;
      if (!vendorRev[vid]) vendorRev[vid] = { revenue: 0, order_count: 0 };
      vendorRev[vid].revenue += Number(o.total_amt) || 0;
      vendorRev[vid].order_count++;
    }
    const top_vendors = Object.entries(vendorRev)
      .map(([vid, d]) => ({
        id: vid,
        name: vendorMap[vid]?.name || 'Unknown',
        revenue: d.revenue,
        order_count: d.order_count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Revenue by category
    const catRev = {};
    for (const item of rangeItems) {
      const cat = productMap[item.product_id]?.category || 'other';
      if (!catRev[cat]) catRev[cat] = { category: cat, revenue: 0, qty_sold: 0 };
      catRev[cat].qty_sold += Number(item.quantity) || 1;
      catRev[cat].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }
    const revenue_by_category = Object.values(catRev).sort((a, b) => b.revenue - a.revenue);

    // Customer growth
    const growthMap = {};
    for (const u of newUsersInRange) {
      const day = u.created_at?.split('T')[0];
      if (!day) continue;
      if (!growthMap[day]) growthMap[day] = { date: day, new_users: 0 };
      growthMap[day].new_users++;
    }
    const customer_growth = Object.values(growthMap).sort((a, b) => a.date.localeCompare(b.date));

    // Recent orders (last 5)
    const userMap = {};
    for (const u of users) userMap[u.id] = u;
    const recent_orders = orders.slice(0, 5).map(o => ({
      id: o.id,
      user_name: userMap[o.user_id]?.name || `#${o.user_id}`,
      total_amt: o.total_amt,
      status: o.status,
      created_at: o.created_at,
    }));

    res.json({
      summary,
      daily_revenue,
      monthly_revenue,
      top_products,
      top_vendors,
      revenue_by_category,
      customer_growth,
      recent_orders,
    });
  } catch (err) {
    console.error('Admin detailed analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/analytics — Dashboard stats
router.get('/analytics', async (req, res) => {
  try {
    const [usersResult, vendorsResult, ordersResult] = await Promise.all([
      supabase.from('user_info').select('id', { count: 'exact', head: true }),
      supabase.from('vendor_info').select('id', { count: 'exact', head: true }),
      supabase.from('order_info').select('id, total_amt, status, commission_amt'),
    ]);

    const allOrders = ordersResult.data || [];
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered');

    const totalRevenue = deliveredOrders
      .reduce((sum, o) => sum + (Number(o.total_amt) || 0), 0);
    const totalCommission = deliveredOrders
      .reduce((sum, o) => sum + (Number(o.commission_amt) || 0), 0);

    res.json({
      analytics: {
        total_users: usersResult.count || 0,
        total_vendors: vendorsResult.count || 0,
        total_orders: allOrders.length,
        total_revenue: totalRevenue,
        total_commission: totalCommission,
        orders_by_status: allOrders.reduce((acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/orders/:id — Full order detail
router.get('/orders/:id', async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('order_info')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Parallel fetch: items, user, vendor
    const [itemsRes, userRes, vendorRes] = await Promise.all([
      supabase.from('order_items').select('*').eq('order_id', order.id),
      order.user_id
        ? supabase.from('user_info').select('*').eq('id', order.user_id).single()
        : Promise.resolve({ data: null }),
      order.vendor_id
        ? supabase.from('vendor_info').select('id, name, shop_name, phone, location').eq('id', order.vendor_id).single()
        : Promise.resolve({ data: null }),
    ]);

    let items = itemsRes.data || [];

    // Attach product info to each item
    if (items.length > 0) {
      const productIds = [...new Set(items.map(i => i.product_id).filter(Boolean))];
      const { data: products } = await supabase
        .from('product_info')
        .select('id, name, category, image_url')
        .in('id', productIds);

      const productMap = {};
      for (const p of (products || [])) productMap[p.id] = p;

      items = items.map(i => ({ ...i, product: productMap[i.product_id] || null }));
    }

    res.json({
      order,
      items,
      user: userRes.data || null,
      vendor: vendorRes.data || null,
    });
  } catch (err) {
    console.error('Admin order detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/orders/:id/status — Advance order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const result = await updateOrderStatus({ orderId: req.params.id, newStatus: status });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ order: result.order });
  } catch (err) {
    console.error('Admin update order status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/products — All products across vendors
router.get('/products', async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = supabase
      .from('product_info')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Admin products fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    let products = data || [];

    // Attach vendor names
    if (products.length > 0) {
      const vendorIds = [...new Set(products.map(p => p.vendor_id).filter(Boolean))];
      if (vendorIds.length > 0) {
        const { data: vendors } = await supabase
          .from('vendor_info')
          .select('id, name')
          .in('id', vendorIds);

        const vendorMap = {};
        for (const v of (vendors || [])) vendorMap[v.id] = v;

        products = products.map(p => ({ ...p, vendor: vendorMap[p.vendor_id] || null }));
      }
    }

    res.json({ products });
  } catch (err) {
    console.error('Admin products route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
