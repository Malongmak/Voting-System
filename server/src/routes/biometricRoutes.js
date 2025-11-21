import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { roles, issueBiometricToken } from '../services/authService.js';
import { verifyFaceSample, enrollFaceTemplate } from '../services/biometricService.js';
import { appendAudit } from '../utils/fileStore.js';
import config from '../config.js';

const router = Router();

router.post('/verify', requireAuth(roles.VOTER), async (req, res) => {
  const { faceSample } = req.body;
  try {
    const isValid = await verifyFaceSample(req.user.sub, faceSample);
    if (!isValid) {
      return res.status(401).json({ error: 'Biometric match failed' });
    }
    await appendAudit(config.dataPaths.auditLog, {
      event: 'biometric_verified',
      actor: req.user.sub
    });
    const biometricToken = issueBiometricToken(req.user.sub);
    res.json({ biometricToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/enroll', requireAuth(roles.ADMIN), async (req, res) => {
  const { studentId, faceSample } = req.body;
  if (!studentId || !faceSample) {
    return res.status(400).json({ error: 'Student ID and face sample required' });
  }
  try {
    const result = await enrollFaceTemplate(studentId, faceSample);
    await appendAudit(config.dataPaths.auditLog, {
      event: 'biometric_enrolled',
      actor: req.user.sub,
      studentId
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

