import supabase from '../config/supabase.js';

export async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const meta = user.user_metadata || {};

    // Determine role from metadata (set during profile creation)
    const role = meta.role || 'customer';
    const dbId = meta.db_id || null;

    let profile = null;

    if (role === 'vendor' && dbId) {
      const { data } = await supabase
        .from('vendor_info')
        .select('*')
        .eq('id', dbId)
        .single();
      profile = data;
    } else if (dbId) {
      const { data } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', dbId)
        .single();
      profile = data;
    }

    req.user = {
      auth_id: user.id,
      email: user.email,
      db_id: dbId,
      role,
      is_admin: profile?.is_admin || role === 'admin',
      name: profile?.name || null,
      location: profile?.location || null,
      ...profile,
    };

    // For customers with a vendor_id, fetch the vendor's shop_name
    if (role === 'customer' && profile?.vendor_id) {
      const { data: vendor } = await supabase
        .from('vendor_info')
        .select('shop_name, name')
        .eq('id', profile.vendor_id)
        .single();
      if (vendor) {
        req.user.vendor_shop_name = vendor.shop_name || vendor.name;
      }
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
