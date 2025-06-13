module.exports = (config) => ({
    allow: (...allowedRoles) => (req, res, next) => {
      const userRoles = req.user?.roles || [];
      const match = allowedRoles.some(r => userRoles.includes(r));
      if (!match) return res.status(403).json({ message: 'Forbidden' });
      next();
    }
  });
  