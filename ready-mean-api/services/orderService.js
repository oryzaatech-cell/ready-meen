import supabase from '../config/supabase.js';
import { isValidTransition } from '../shared/constants.js';

/**
 * Place a new order — validates stock, calculates totals, creates order + items
 */
export async function placeOrder({ user_id, items, shipping_address, vendor_id, payment_method = 'cod' }) {
  let totalAmt = 0;
  const validatedItems = [];

  for (const item of items) {
    const { product_id, qty, cutting_type = 'whole', cleaning = false } = item;

    if (!product_id || !qty || qty <= 0) {
      return { error: 'Each item needs product_id and positive qty' };
    }

    // Fetch product
    const { data: product, error } = await supabase
      .from('product_info')
      .select('*')
      .eq('id', product_id)
      .single();

    if (error || !product) {
      return { error: `Product ${product_id} not found` };
    }

    if (product.stock_qty < qty) {
      return { error: `Insufficient stock for ${product.name}. Available: ${product.stock_qty}` };
    }

    // Compute effective price: base + cutting charge + cleaning charge
    let effectivePrice = product.price;

    if (cutting_type && cutting_type !== 'whole' && Array.isArray(product.cutting_options)) {
      const option = product.cutting_options.find(o => o.type === cutting_type);
      if (option?.charge) {
        effectivePrice += option.charge;
      }
    }

    if (cleaning && product.cleaning_charge) {
      effectivePrice += product.cleaning_charge;
    }

    const itemTotal = effectivePrice * qty;
    totalAmt += itemTotal;

    validatedItems.push({
      product_id,
      qty,
      price: effectivePrice,
      cutting_type,
      cleaning,
      _product: product,
    });
  }

  // Verify all products belong to the same vendor
  const vendorIds = [...new Set(validatedItems.map(i => i._product.vendor_id))];
  if (vendorIds.length > 1) {
    return { error: 'All items must be from the same vendor' };
  }

  const resolvedVendorId = vendor_id || vendorIds[0] || null;

  // Fetch vendor's commission rate and snapshot it
  let commissionRate = 0;
  let commissionAmt = 0;
  if (resolvedVendorId) {
    const { data: vendorData } = await supabase
      .from('vendor_info')
      .select('commission_rate')
      .eq('id', resolvedVendorId)
      .single();
    commissionRate = Number(vendorData?.commission_rate) || 0;
    commissionAmt = Math.round(totalAmt * (commissionRate / 100) * 100) / 100;
  }

  // Create order
  const orderData = {
    user_id,
    status: 'placed',
    total_amt: totalAmt,
    shipping_address,
    payment_method: payment_method || 'cod',
    commission_rate: commissionRate,
    commission_amt: commissionAmt,
  };
  if (resolvedVendorId) {
    orderData.vendor_id = resolvedVendorId;
  }

  const { data: order, error: orderError } = await supabase
    .from('order_info')
    .insert(orderData)
    .select()
    .single();

  if (orderError) {
    console.error('Order insert error:', orderError);
    return { error: `Failed to create order: ${orderError.message || orderError.details || 'Unknown DB error'}` };
  }

  // Deduct stock atomically — only succeeds if enough stock remains
  for (const item of validatedItems) {
    const { data: updated, error: stockError } = await supabase
      .from('product_info')
      .update({ stock_qty: item._product.stock_qty - item.qty })
      .eq('id', item.product_id)
      .gte('stock_qty', item.qty)  // Only deduct if stock >= requested qty
      .select('id')
      .single();

    if (stockError || !updated) {
      // Stock was grabbed by another order — restore any already-deducted items
      for (const prev of validatedItems) {
        if (prev.product_id === item.product_id) break;
        // Re-read current stock and restore
        const { data: current } = await supabase
          .from('product_info')
          .select('stock_qty')
          .eq('id', prev.product_id)
          .single();
        if (current) {
          await supabase
            .from('product_info')
            .update({ stock_qty: current.stock_qty + prev.qty })
            .eq('id', prev.product_id);
        }
      }
      // Clean up the order
      await supabase.from('order_info').delete().eq('id', order.id);
      return { error: `Sorry, ${item._product.name} just sold out. Please try again.` };
    }
  }

  // Create order items (stock is already secured)
  const orderItemRows = validatedItems.map(i => ({
    order_id: order.id,
    product_id: i.product_id,
    qty: i.qty,
    price: i.price,
    cutting_type: i.cutting_type || 'whole',
    cleaning: i.cleaning || false,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemRows);

  if (itemsError) {
    console.error('Order items insert error:', itemsError);
    // Restore stock since items insert failed
    for (const item of validatedItems) {
      const { data: current } = await supabase
        .from('product_info')
        .select('stock_qty')
        .eq('id', item.product_id)
        .single();
      if (current) {
        await supabase
          .from('product_info')
          .update({ stock_qty: current.stock_qty + item.qty })
          .eq('id', item.product_id);
      }
    }
    await supabase.from('order_info').delete().eq('id', order.id);
    return { error: `Failed to create order items: ${itemsError.message}` };
  }

  return { order };
}

/**
 * Update order status — validates transition
 */
export async function updateOrderStatus({ orderId, newStatus }) {
  const { data: order, error } = await supabase
    .from('order_info')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { error: 'Order not found' };
  }

  if (!isValidTransition(order.status, newStatus)) {
    return { error: `Invalid status transition: ${order.status} -> ${newStatus}` };
  }

  // Atomic update — only succeeds if status hasn't changed since we read it
  const { data: updated, error: updateError } = await supabase
    .from('order_info')
    .update({ status: newStatus })
    .eq('id', orderId)
    .eq('status', order.status)
    .select()
    .single();

  if (!updated && !updateError) {
    return { error: 'Order status was already changed. Please refresh and try again.' };
  }

  if (updateError) {
    return { error: 'Failed to update order status' };
  }

  return { order: updated };
}
