import { Router } from 'express';
import { authenticateVoter, authenticateAdmin, roles } from '../services/authService.js';

const router = Router();

router.post('/voter/login', async (req, res) => {
  const { studentId, pin } = req.body;
  if (!studentId || !pin) return res.status(400).json({ error: 'Student ID and PIN required' });
  const token = await authenticateVoter(studentId, pin);
  if (!token) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token, role: roles.VOTER });
});

router.post('/admin/login', async (req, res) => {
  const { secret } = req.body;
  if (!secret) return res.status(400).json({ error: 'Secret required' });
  const token = await authenticateAdmin(secret);
  if (!token) return res.status(401).json({ error: 'Invalid admin secret' });
  res.json({ token, role: roles.ADMIN });
});

export default router;

