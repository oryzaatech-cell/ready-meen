import { Router } from 'express';
import supabase from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications — List user's notifications
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const userRole = req.user.role || 'customer';

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.db_id)
      .eq('user_role', userRole)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    // Get unread count
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.db_id)
      .eq('user_role', userRole)
      .eq('is_read', false);

    res.json({ notifications: data || [], unread_count: count || 0 });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/notifications/read-all — Mark all as read
router.put('/read-all', authenticateUser, async (req, res) => {
  try {
    const userRole = req.user.role || 'customer';

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.db_id)
      .eq('user_role', userRole)
      .eq('is_read', false);

    if (error) {
      return res.status(500).json({ error: 'Failed to mark notifications as read' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notifications/unread-count — Quick unread count
router.get('/unread-count', authenticateUser, async (req, res) => {
  try {
    const userRole = req.user.role || 'customer';

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.db_id)
      .eq('user_role', userRole)
      .eq('is_read', false);

    res.json({ count: count || 0 });
  } catch (err) {
    res.json({ count: 0 });
  }
});

export default router;
