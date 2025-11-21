import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/lookup', async (req, res) => {
  const { studentId = '', phone = '' } = req.query;
  if (!studentId && !phone) {
    return res.status(400).json({ error: 'Provide studentId or phone' });
  }
  const db = await getDb();
  const voter = await db.get(
    'SELECT studentId, name, grade, phone, votedAt FROM voters WHERE studentId = ? OR phone = ?',
    studentId || null,
    phone || null
  );
  if (!voter) {
    return res.json({ registered: false });
  }
  res.json({
    registered: true,
    voter: {
      studentId: voter.studentId,
      name: voter.name,
      grade: voter.grade,
      phone: voter.phone,
      votedAt: voter.votedAt
    }
  });
});

router.post('/lookup/sms', async (req, res) => {
  const { studentId, phone } = req.body;
  if (!studentId || !phone) {
    return res.status(400).json({ error: 'Student ID and phone required' });
  }
  const db = await getDb();
  const voter = await db.get('SELECT studentId FROM voters WHERE studentId = ?', studentId);
  if (!voter) {
    return res.json({ delivered: true, message: 'Not registered. Please visit the nearest registration centre.' });
  }
  res.json({
    delivered: true,
    message: `Hi ${studentId}, your registration is confirmed. Present yourself with ID on polling day.`,
    phone
  });
});

export default router;

