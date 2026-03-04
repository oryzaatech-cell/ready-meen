import { Router } from 'express';
import supabase from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

const MAX_ADDRESSES = 3;

// GET /api/addresses — List customer's saved addresses
router.get('/', authenticateUser, requireRole('customer'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('user_id', req.user.db_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Addresses fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch addresses' });
    }

    res.json({ addresses: data || [] });
  } catch (err) {
    console.error('Addresses route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/addresses — Add new address (max 3)
router.post('/', authenticateUser, requireRole('customer'), async (req, res) => {
  try {
    const { label, flat_name, flat_number, floor, area, name, phone } = req.body;

    if (!flat_name || !area || !name || !phone) {
      return res.status(400).json({ error: 'Building name, area, name, and phone are required' });
    }

    // Enforce max 3 addresses
    const { count, error: countError } = await supabase
      .from('customer_addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.db_id);

    if (countError) {
      console.error('Address count error:', countError);
      return res.status(500).json({ error: 'Failed to check address count' });
    }

    if (count >= MAX_ADDRESSES) {
      return res.status(400).json({ error: `Maximum ${MAX_ADDRESSES} addresses allowed` });
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert({
        user_id: req.user.db_id,
        label: label || null,
        flat_name,
        flat_number: flat_number || null,
        floor: floor || null,
        area,
        name,
        phone,
      })
      .select()
      .single();

    if (error) {
      console.error('Address create error:', error);
      return res.status(500).json({ error: 'Failed to save address' });
    }

    res.status(201).json({ address: data });
  } catch (err) {
    console.error('Address create route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/addresses/:id — Update address (verify ownership)
router.put('/:id', authenticateUser, requireRole('customer'), async (req, res) => {
  try {
    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('customer_addresses')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (existing.user_id !== req.user.db_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { label, flat_name, flat_number, floor, area, name, phone } = req.body;

    if (!flat_name || !area || !name || !phone) {
      return res.status(400).json({ error: 'Building name, area, name, and phone are required' });
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .update({
        label: label || null,
        flat_name,
        flat_number: flat_number || null,
        floor: floor || null,
        area,
        name,
        phone,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('Address update error:', error);
      return res.status(500).json({ error: 'Failed to update address' });
    }

    res.json({ address: data });
  } catch (err) {
    console.error('Address update route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/addresses/:id — Delete address (verify ownership)
router.delete('/:id', authenticateUser, requireRole('customer'), async (req, res) => {
  try {
    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('customer_addresses')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (existing.user_id !== req.user.db_id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Address delete error:', error);
      return res.status(500).json({ error: 'Failed to delete address' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Address delete route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
