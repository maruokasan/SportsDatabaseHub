module.exports = (roles = []) => {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (allowed.length && !allowed.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return next();
  };
};
