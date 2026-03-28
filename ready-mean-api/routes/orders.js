import { Router } from 'express';
import supabase from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { placeOrder, updateOrderStatus } from '../services/orderService.js';
import { sendNotification } from '../services/notificationService.js';

const router = Router();

// POST /api/orders — Place order (customer)
router.post('/', authenticateUser, requireRole('customer'), async (req, res) => {
  try {
    const { items, shipping_address, payment_method } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    const result = await placeOrder({
      user_id: req.user.db_id,
      items,
      shipping_address: shipping_address || null,
      vendor_id: req.user.vendor_id || null,
      payment_method: payment_method || 'cod',
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Notify vendor about new order (non-blocking)
    console.log('Order placed:', { id: result.order?.id, vendor_id: result.order?.vendor_id, user_vendor_id: req.user.vendor_id });
    if (result.order?.vendor_id) {
      console.log('Sending vendor notification to vendor_id:', result.order.vendor_id);
      sendNotification(result.order.vendor_id, {
        title: 'New Order Received!',
        body: `Order #${result.order.id} — ₹${result.order.total_amt} (${payment_method === 'cod' ? 'COD' : 'Paid'})`,
        data: { type: 'new_order', order_id: String(result.order.id) },
        role: 'vendor',
      }).catch(err => console.error('Vendor notification failed:', err));
    } else {
      console.warn('Order has no vendor_id, skipping vendor notification');
    }

    // Confirm to customer
    sendNotification(req.user.db_id, {
      title: 'Order Placed!',
      body: `Your order #${result.order.id} for ₹${result.order.total_amt} has been placed`,
      data: { type: 'order_placed', order_id: String(result.order.id) },
      role: 'customer',
    }).catch(err => console.error('Customer notification failed:', err));

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
      .select('id, user_id, vendor_id, status, total_amt, shipping_address, payment_method, created_at')
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

    // Attach order_items and user info to each order
    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: allItems } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      // Fetch product info for item names and images
      const productIds = [...new Set((allItems || []).map(i => i.product_id).filter(Boolean))];
      let productsMap = {};
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('product_info')
          .select('id, name, image_url')
          .in('id', productIds);
        for (const p of (products || [])) {
          productsMap[p.id] = p;
        }
      }

      const itemsByOrder = {};
      for (const item of (allItems || [])) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push({ ...item, product: productsMap[item.product_id] || null });
      }

      // Fetch customer info for each order
      const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
      let usersMap = {};
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('user_info')
          .select('id, name, mobile')
          .in('id', userIds);
        for (const u of (users || [])) {
          usersMap[u.id] = u;
        }
      }

      orders = orders.map(o => ({
        ...o,
        order_items: itemsByOrder[o.id] || [],
        user: usersMap[o.user_id] || null,
      }));
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

    // Notify customer about status change (non-blocking)
    if (result.order?.user_id) {
      const statusLabels = { processing: 'Being Prepared', ready: 'Ready for Delivery', delivered: 'Delivered' };
      sendNotification(result.order.user_id, {
        title: `Order ${statusLabels[status] || status}`,
        body: `Your order #${result.order.id} is now ${statusLabels[status] || status}`,
        data: { type: 'order_update', order_id: String(result.order.id) },
        role: 'customer',
      }).catch(() => {});
    }

    res.json({ order: result.order });
  } catch (err) {
    console.error('Order status update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/orders/:id/vendor-cancel — Vendor cancels an order
router.put('/:id/vendor-cancel', authenticateUser, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    const { data: order } = await supabase
      .from('order_info')
      .select('id, user_id, vendor_id, status')
      .eq('id', req.params.id)
      .single();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role === 'vendor' && order.vendor_id !== req.user.db_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!['placed', 'processing', 'cancel_requested'].includes(order.status)) {
      return res.status(400).json({ error: 'Can only cancel orders in placed or processing status' });
    }

    // Atomically set status to cancelled — only if status hasn't changed
    const { data, error } = await supabase
      .from('order_info')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .eq('status', order.status)
      .select()
      .single();

    if (error || !data) {
      return res.status(409).json({ error: 'Order status has changed. Please refresh and try again.' });
    }

    // Restore stock (safe — status is already cancelled so no double-restore)
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

    // Notify customer
    if (order.user_id) {
      sendNotification(order.user_id, {
        title: 'Order Cancelled by Vendor',
        body: `Your order #${order.id} has been cancelled by the vendor`,
        data: { type: 'order_cancelled', order_id: String(order.id) },
        role: 'customer',
      }).catch(() => {});
    }

    res.json({ order: data });
  } catch (err) {
    console.error('Vendor cancel error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/orders/:id/cancel — Cancel order (customer, only if placed/cancel_requested)
router.put('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const { data: order } = await supabase
      .from('order_info')
      .select('id, user_id, vendor_id, status, created_at')
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

    // Within 2 minutes — instant cancel, no vendor approval needed
    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const TWO_MINUTES = 2 * 60 * 1000;

    if (orderAge <= TWO_MINUTES) {
      // Atomically set status to cancelled — only if still placed
      const { data, error } = await supabase
        .from('order_info')
        .update({ status: 'cancelled' })
        .eq('id', req.params.id)
        .eq('status', 'placed')
        .select()
        .single();

      if (error || !data) {
        return res.status(409).json({ error: 'Order status has changed. Please refresh and try again.' });
      }

      // Restore stock (safe — status is already cancelled)
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

      // Notify vendor that customer cancelled
      if (order.vendor_id) {
        sendNotification(order.vendor_id, {
          title: 'Order Cancelled',
          body: `Customer cancelled Order #${order.id}`,
          data: { type: 'order_cancelled', order_id: String(order.id) },
          role: 'vendor',
        }).catch(() => {});
      }

      // Confirm cancellation to customer
      sendNotification(order.user_id, {
        title: 'Order Cancelled',
        body: `Your order #${order.id} has been cancelled`,
        data: { type: 'order_cancelled', order_id: String(order.id) },
        role: 'customer',
      }).catch(() => {});

      return res.json({ order: data });
    }

    // After 2 minutes — send cancel request to vendor for approval (atomic)
    const { data, error } = await supabase
      .from('order_info')
      .update({ status: 'cancel_requested' })
      .eq('id', req.params.id)
      .eq('status', 'placed')
      .select()
      .single();

    if (error || !data) {
      return res.status(409).json({ error: 'Order status has changed. Please refresh and try again.' });
    }

    // Notify vendor about cancel request
    if (order.vendor_id) {
      sendNotification(order.vendor_id, {
        title: 'Cancel Request',
        body: `Customer wants to cancel Order #${order.id}`,
        data: { type: 'cancel_request', order_id: String(order.id) },
        role: 'vendor',
      }).catch(() => {});
    }

    res.json({ order: data, cancel_requested: true });
  } catch (err) {
    console.error('Order cancel error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/orders/:id/cancel-respond — Vendor approve/reject cancel request
router.put('/:id/cancel-respond', authenticateUser, requireRole('vendor', 'admin'), async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
    }

    const { data: order } = await supabase
      .from('order_info')
      .select('id, user_id, vendor_id, status')
      .eq('id', req.params.id)
      .single();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role === 'vendor' && order.vendor_id !== req.user.db_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.status !== 'cancel_requested') {
      return res.status(400).json({ error: 'No pending cancel request for this order' });
    }

    if (action === 'approve') {
      // Atomically set status to cancelled — only if still cancel_requested
      const { data, error } = await supabase
        .from('order_info')
        .update({ status: 'cancelled' })
        .eq('id', req.params.id)
        .eq('status', 'cancel_requested')
        .select()
        .single();

      if (error || !data) {
        return res.status(409).json({ error: 'Order status has changed. Please refresh and try again.' });
      }

      // Restore stock (safe — status is already cancelled)
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

      // Notify customer
      if (order.user_id) {
        sendNotification(order.user_id, {
          title: 'Order Cancelled',
          body: `Your cancellation request for Order #${order.id} has been approved`,
          data: { type: 'cancel_approved', order_id: String(order.id) },
          role: 'customer',
        }).catch(() => {});
      }

      return res.json({ order: data });
    }

    // Reject — restore to placed, mark rejection (atomic — only if still cancel_requested)
    const { data, error } = await supabase
      .from('order_info')
      .update({ status: 'placed', cancel_rejected_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('status', 'cancel_requested')
      .select()
      .single();

    if (error || !data) {
      return res.status(409).json({ error: 'Order status has changed. Please refresh and try again.' });
    }

    // Notify customer
    if (order.user_id) {
      sendNotification(order.user_id, {
        title: 'Cancel Request Rejected',
        body: `Your cancellation request for Order #${order.id} was rejected by the vendor`,
        data: { type: 'cancel_rejected', order_id: String(order.id) },
        role: 'customer',
      }).catch(() => {});
    }

    res.json({ order: data });
  } catch (err) {
    console.error('Cancel respond error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
