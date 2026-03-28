import { Router } from 'express';
import supabase from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateRequired } from '../shared/validators.js';
import { generateVendorCode } from '../shared/vendorCode.js';

const router = Router();

// GET /api/auth/verify-vendor-code/:code — Public: verify code and return vendor shop name
router.get('/verify-vendor-code/:code', async (req, res) => {
  try {
    const code = req.params.code?.trim().toUpperCase();
    if (!code || code.length < 4) {
      return res.status(400).json({ error: 'Invalid vendor code' });
    }

    const { data: vendor, error } = await supabase
      .from('vendor_info')
      .select('id, shop_name, name')
      .eq('vendor_code', code)
      .maybeSingle();

    if (error) {
      console.error('Vendor code lookup error:', error);
      return res.status(500).json({ error: 'Failed to verify code' });
    }

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ vendor: { id: vendor.id, shop_name: vendor.shop_name || vendor.name } });
  } catch (err) {
    console.error('Verify vendor code error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/signup — Server-side signup (mobile-based)
router.post('/signup', async (req, res) => {
  try {
    const { name, mobile, password, role, shop_name, location, vendor_code } = req.body;

    // Validate
    const nameCheck = validateRequired(name, 'Name');
    if (!nameCheck.valid) return res.status(400).json({ error: nameCheck.error });
    if (!mobile || mobile.trim().length < 10) return res.status(400).json({ error: 'Valid mobile number is required' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const selectedRole = role || 'customer';
    const validRoles = ['customer', 'vendor'];
    if (!validRoles.includes(selectedRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Vendor code is required for customers
    if (selectedRole === 'customer' && !vendor_code?.trim()) {
      return res.status(400).json({ error: 'Vendor code is required' });
    }

    // Generate synthetic email from mobile for Supabase auth
    const syntheticEmail = `${mobile.trim()}@readymean.app`;

    // Look up the vendor for the provided code
    let linkedVendorId = null;
    if (selectedRole === 'customer' && vendor_code) {
      const code = vendor_code.trim().toUpperCase();
      const { data: vendor } = await supabase
        .from('vendor_info')
        .select('id')
        .eq('vendor_code', code)
        .maybeSingle();

      if (!vendor) {
        return res.status(400).json({ error: 'Invalid vendor code' });
      }
      linkedVendorId = vendor.id;
    }

    // 1. Create auth user via admin API (synthetic email, auto-confirmed)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      user_metadata: { name: name.trim(), role: selectedRole },
    });

    if (authError) {
      console.error('Auth create error:', authError);
      if (authError.message?.includes('already been registered')) {
        return res.status(409).json({ error: 'An account with this mobile number already exists' });
      }
      return res.status(400).json({ error: authError.message });
    }

    const authId = authData.user.id;

    // 2. Create profile in the appropriate table
    let profile = null;
    let dbId = null;

    if (selectedRole === 'vendor') {
      const generatedCode = await generateVendorCode();

      const { data, error } = await supabase
        .from('vendor_info')
        .insert({
          name: name.trim(),
          auth_id: authId,
          phone: mobile.trim(),
          shop_name: shop_name || null,
          location: location || null,
          vendor_code: generatedCode,
        })
        .select()
        .single();

      if (error) {
        console.error('Vendor create error:', error);
        await supabase.auth.admin.deleteUser(authId);
        return res.status(500).json({ error: 'Failed to create vendor profile' });
      }
      profile = data;
      dbId = data.id;
    } else {
      const { data, error } = await supabase
        .from('user_info')
        .insert({
          name: name.trim(),
          mobile: mobile.trim(),
          auth_id: authId,
          is_admin: false,
          vendor_id: linkedVendorId,
        })
        .select()
        .single();

      if (error) {
        console.error('User create error:', error);
        await supabase.auth.admin.deleteUser(authId);
        return res.status(500).json({ error: 'Failed to create customer profile: ' + error.message });
      }
      profile = data;
      dbId = data.id;
    }

    // 3. Update auth user metadata with db_id
    await supabase.auth.admin.updateUserById(authId, {
      user_metadata: { name: name.trim(), role: selectedRole, db_id: dbId },
    });

    res.json({ success: true, profile: { ...profile, role: selectedRole }, syntheticEmail });
  } catch (err) {
    console.error('Signup route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/profile — Create or update user/vendor profile
router.post('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, role, mobile, shop_name, location, vendor_code } = req.body;

    const nameCheck = validateRequired(name, 'Name');
    if (!nameCheck.valid) {
      return res.status(400).json({ error: nameCheck.error });
    }

    const validRoles = ['customer', 'vendor'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const selectedRole = role || 'customer';
    const authId = req.user.auth_id;
    let dbId = null;
    let profile = null;

    // If customer provides a vendor_code, look up the vendor
    let linkedVendorId = null;
    if (selectedRole === 'customer' && vendor_code) {
      const code = vendor_code.trim().toUpperCase();
      const { data: vendor } = await supabase
        .from('vendor_info')
        .select('id')
        .eq('vendor_code', code)
        .maybeSingle();

      if (vendor) {
        linkedVendorId = vendor.id;
      }
    }

    if (selectedRole === 'vendor') {
      const vendorData = {
        name: name.trim(),
        auth_id: authId,
        phone: mobile || req.user.phone || null,
        shop_name: shop_name || null,
        location: location || null,
      };

      if (req.user.db_id && req.user.role === 'vendor') {
        const { data, error } = await supabase
          .from('vendor_info')
          .update(vendorData)
          .eq('id', req.user.db_id)
          .select()
          .single();
        if (error) {
          console.error('Vendor update error:', error);
          return res.status(500).json({ error: 'Failed to update vendor profile' });
        }
        profile = data;
        dbId = data.id;

        if (!profile.vendor_code) {
          const generatedCode = await generateVendorCode();
          await supabase
            .from('vendor_info')
            .update({ vendor_code: generatedCode })
            .eq('id', dbId);
          profile.vendor_code = generatedCode;
        }
      } else {
        const generatedCode = await generateVendorCode();
        const { data, error } = await supabase
          .from('vendor_info')
          .insert({ ...vendorData, vendor_code: generatedCode })
          .select()
          .single();
        if (error) {
          console.error('Vendor create error:', error);
          return res.status(500).json({ error: 'Failed to create vendor profile' });
        }
        profile = data;
        dbId = data.id;
      }
    } else {
      const userData = {
        name: name.trim(),
        mobile: mobile || req.user.mobile || null,
        auth_id: authId,
      };

      if (linkedVendorId) {
        userData.vendor_id = linkedVendorId;
      }

      if (req.user.db_id && req.user.role !== 'vendor') {
        if (linkedVendorId && !req.user.vendor_id) {
          userData.vendor_id = linkedVendorId;
        }

        const { data, error } = await supabase
          .from('user_info')
          .update(userData)
          .eq('id', req.user.db_id)
          .select()
          .single();
        if (error) {
          console.error('User update error:', error);
          return res.status(500).json({ error: 'Failed to update profile' });
        }
        profile = data;
        dbId = data.id;
      } else {
        const { data, error } = await supabase
          .from('user_info')
          .insert(userData)
          .select()
          .single();
        if (error) {
          console.error('User create error:', error);
          return res.status(500).json({ error: 'Failed to create profile' });
        }
        profile = data;
        dbId = data.id;
      }
    }

    await supabase.auth.admin.updateUserById(authId, {
      user_metadata: { role: selectedRole, db_id: dbId },
    });

    res.json({ profile: { ...profile, role: selectedRole } });
  } catch (err) {
    console.error('Profile route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-identity — Verify user identity for password reset
router.post('/verify-identity', async (req, res) => {
  try {
    const { mobile, name } = req.body;

    if (!mobile || mobile.trim().length < 10) {
      return res.status(400).json({ error: 'Valid mobile number is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check customer table
    const { data: customer, error: custErr } = await supabase
      .from('user_info')
      .select('id, name')
      .eq('mobile', mobile.trim())
      .maybeSingle();

    if (custErr) {
      console.error('Verify identity customer error:', custErr);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Check vendor table
    const { data: vendor, error: vendErr } = await supabase
      .from('vendor_info')
      .select('id, name')
      .eq('phone', mobile.trim())
      .maybeSingle();

    if (vendErr) {
      console.error('Verify identity vendor error:', vendErr);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const user = customer || vendor;
    if (!user || user.name.toLowerCase() !== name.trim().toLowerCase()) {
      return res.status(400).json({ error: 'Mobile number and name do not match our records' });
    }

    res.json({ verified: true });
  } catch (err) {
    console.error('Verify identity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password — Reset password after identity verification
router.post('/reset-password', async (req, res) => {
  try {
    const { mobile, name, password } = req.body;

    if (!mobile || mobile.trim().length < 10) {
      return res.status(400).json({ error: 'Valid mobile number is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Re-verify identity — check both tables
    const { data: customer } = await supabase
      .from('user_info')
      .select('id, name, auth_id')
      .eq('mobile', mobile.trim())
      .maybeSingle();

    const { data: vendor } = await supabase
      .from('vendor_info')
      .select('id, name, auth_id')
      .eq('phone', mobile.trim())
      .maybeSingle();

    const user = customer || vendor;
    if (!user || user.name.toLowerCase() !== name.trim().toLowerCase()) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    // Update password via Supabase admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.auth_id, {
      password,
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/fcm-token — Save FCM token for push notifications
router.put('/fcm-token', authenticateUser, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const table = req.user.role === 'vendor' ? 'vendor_info' : 'user_info';
    const { error } = await supabase
      .from(table)
      .update({ fcm_token: token })
      .eq('id', req.user.db_id);

    if (error) {
      console.error('FCM token save error:', error);
      return res.status(500).json({ error: 'Failed to save token' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('FCM token route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/auth/fcm-token — Clear FCM token on logout
router.delete('/fcm-token', authenticateUser, async (req, res) => {
  try {
    const table = req.user.role === 'vendor' ? 'vendor_info' : 'user_info';
    await supabase
      .from(table)
      .update({ fcm_token: null })
      .eq('id', req.user.db_id);

    res.json({ success: true });
  } catch (err) {
    console.error('FCM token clear error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me — Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
