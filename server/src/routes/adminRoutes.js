import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { roles } from '../services/authService.js';
import { decryptAllBallots } from '../services/ballotService.js';
import { loadJson } from '../utils/fileStore.js';
import config from '../config.js';
import { getDb } from '../db.js';

const router = Router();

router.get('/ballots/decrypted', requireAuth(roles.ADMIN), async (req, res) => {
  const ballots = await decryptAllBallots();
  res.json(ballots);
});

router.get('/audit-log', requireAuth(roles.ADMIN), async (req, res) => {
  const entries = await loadJson(config.dataPaths.auditLog, []);
  res.json(entries);
});

router.get('/voters', requireAuth(roles.ADMIN), async (req, res) => {
  const db = await getDb();
  const voters = await db.all('SELECT studentId, name, grade, phone, faceTemplate IS NOT NULL as hasFaceTemplate, votedAt, createdAt FROM voters');
  res.json(voters);
});

router.get('/voters/printable', requireAuth(roles.ADMIN), async (req, res) => {
  const db = await getDb();
  const voters = await db.all('SELECT studentId, name, grade, phone, votedAt FROM voters ORDER BY grade, name');
  res.json({
    generatedAt: new Date().toISOString(),
    electionId: config.electionId,
    voters
  });
});

export default router;

