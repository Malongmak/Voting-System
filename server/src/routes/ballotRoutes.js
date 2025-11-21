import { Router } from 'express';
import { submitBallot, listBallots } from '../services/ballotService.js';
import { requireAuth } from '../middleware/auth.js';
import { registerVoteIssued, verifyBiometricToken, roles } from '../services/authService.js';

const router = Router();

router.post('/', requireAuth(roles.VOTER), async (req, res) => {
  try {
    const biometricToken = req.headers['x-biometric-token'];
    if (!biometricToken) {
      return res.status(401).json({ error: 'Biometric verification required' });
    }
    try {
      verifyBiometricToken(biometricToken, req.user.sub);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }

    const { selections } = req.body;
    if (!selections) return res.status(400).json({ error: 'Selections missing' });
    const receipt = await submitBallot(req.user.sub, selections);
    await registerVoteIssued(req.user.sub);
    res.json({ message: 'Ballot recorded securely', receipt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/summary', requireAuth(roles.ADMIN), async (req, res) => {
  const ballots = await listBallots();
  res.json({
    total: ballots.length,
    ballots: ballots.map((ballot) => ({
      id: ballot.id,
      studentId: ballot.studentId,
      submittedAt: ballot.submittedAt
    }))
  });
});

export default router;

