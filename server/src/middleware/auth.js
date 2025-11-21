import { verifyToken } from '../services/authService.js';

export function requireAuth(role) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Invalid Authorization format' });
    try {
      const payload = verifyToken(token);
      if (role && payload.role !== role) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

