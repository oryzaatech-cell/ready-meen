export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`Role check failed: required=${roles.join(',')}, current=${req.user.role}, db_id=${req.user.db_id}, path=${req.originalUrl}`);
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
}
