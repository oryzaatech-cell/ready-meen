import supabase from '../config/supabase.js';
import { isValidTransition } from '../shared/constants.js';

/**
 * Place a new order — validates stock, calculates totals, creates order + items
 */
export async function placeOrder({ user_id, items, shipping_address, vendor_id }) {
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

  // Determine vendor_id from the first product if not explicitly provided
  const resolvedVendorId = vendor_id || validatedItems[0]?._product?.vendor_id || null;

  // Create order
  const orderData = {
    user_id,
    status: 'placed',
    total_amt: totalAmt,
    shipping_address,
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
    return { error: 'Failed to create order' };
  }

  // Create order items
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
    // Clean up the order since items failed
    await supabase.from('order_info').delete().eq('id', order.id);
    return { error: 'Failed to create order items' };
  }

  // Deduct stock
  for (const item of validatedItems) {
    const product = item._product;
    await supabase
      .from('product_info')
      .update({ stock_qty: product.stock_qty - item.qty })
      .eq('id', product.id);
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

  const { data: updated, error: updateError } = await supabase
    .from('order_info')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (updateError) {
    return { error: 'Failed to update order status' };
  }

  return { order: updated };
}
