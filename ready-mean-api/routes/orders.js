import { Router } from 'express';
import supabase from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { placeOrder, updateOrderStatus } from '../services/orderService.js';

const router = Router();

// POST /api/orders — Place order (customer)
router.post('/', authenticateUser, requireRole('customer'), async (req, res) => {
  try {
    const { items, shipping_address } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    const result = await placeOrder({
      user_id: req.user.db_id,
      items,
      shipping_address: shipping_address || null,
      vendor_id: req.user.vendor_id || null,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({ order: result.order });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders — List own orders (role-filtered)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('order_info')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Filter by role at DB level
    if (req.user.role === 'customer') {
      query = query.eq('user_id', req.user.db_id);
    } else if (req.user.role === 'vendor') {
      query = query.eq('vendor_id', req.user.db_id);
    }

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      console.error('Orders fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    let orders = data || [];

    // Attach order_items to each order
    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: allItems } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      const itemsByOrder = {};
      for (const item of (allItems || [])) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      }
      orders = orders.map(o => ({ ...o, order_items: itemsByOrder[o.id] || [] }));
    }

    res.json({ orders });
  } catch (err) {
    console.error('Orders route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/:id — Order detail
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('order_info')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Authorization: customers see their own, vendors see their store's orders
    if (req.user.role === 'customer' && order.user_id !== req.user.db_id) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    if (req.user.role === 'vendor' && order.vendor_id !== req.user.db_id) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    // Fetch order items with product details
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    // Fetch product info for each item
    const productIds = [...new Set((items || []).map(i => i.product_id).filter(Boolean))];
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('product_info')
        .select('id, name, category, image_url')
        .in('id', productIds);
      for (const p of (products || [])) {
        productsMap[p.id] = p;
      }
    }

    // Fetch user info (include mobile for vendor view)
    let user = null;
    if (order.user_id) {
      const { data: u } = await supabase
        .from('user_info')
        .select('id, name, mobile')
        .eq('id', order.user_id)
        .single();
      user = u;
    }

    res.json({
      order: {
        ...order,
        user,
        order_items: (items || []).map(item => ({
          ...item,
          product: productsMap[item.product_id] || null,
        })),
      },
    });
  } catch (err) {
    console.error('Order detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/orders/:id/status — Update order status (vendor or admin)
router.put('/:id/status', authenticateUser, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    // Verify vendor owns this order
    if (req.user.role === 'vendor') {
      const { data: order } = await supabase
        .from('order_info')
        .select('vendor_id')
        .eq('id', req.params.id)
        .single();

      if (!order || order.vendor_id !== req.user.db_id) {
        return res.status(403).json({ error: 'Not authorized to update this order' });
      }
    }

    const result = await updateOrderStatus({
      orderId: req.params.id,
      newStatus: status,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ order: result.order });
  } catch (err) {
    console.error('Order status update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/orders/:id/cancel — Cancel order (customer, only if placed)
router.put('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const { data: order } = await supabase
      .from('order_info')
      .select('id, user_id, status')
      .eq('id', req.params.id)
      .single();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user_id !== req.user.db_id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({ error: 'Can only cancel orders that are still in "placed" status' });
    }

    // Restore stock for each item
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, qty')
      .eq('order_id', order.id);

    for (const item of (items || [])) {
      if (!item.product_id) continue;
      const { data: product } = await supabase
        .from('product_info')
        .select('id, stock_qty')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('product_info')
          .update({ stock_qty: product.stock_qty + item.qty })
          .eq('id', product.id);
      }
    }

    const { data, error } = await supabase
      .from('order_info')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to cancel order' });
    }

    res.json({ order: data });
  } catch (err) {
    console.error('Order cancel error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
