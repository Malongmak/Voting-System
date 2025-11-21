import jwt from 'jsonwebtoken';
import config from '../config.js';
import { appendAudit } from '../utils/fileStore.js';
import { hashPin } from './cryptoService.js';
import { getDb } from '../db.js';

const roles = {
  VOTER: 'voter',
  ADMIN: 'admin'
};

export { roles };

export async function authenticateVoter(studentId, pin) {
  const db = await getDb();
  const voter = await db.get('SELECT studentId, name, grade, pinHash FROM voters WHERE studentId = ?', studentId);
  if (!voter || voter.pinHash !== hashPin(pin)) return null;
  await appendAudit(config.dataPaths.auditLog, {
    event: 'voter_login',
    actor: studentId
  });
  return issueToken({ sub: studentId, name: voter.name, grade: voter.grade, role: roles.VOTER });
}

export async function authenticateAdmin(secret) {
  if (secret !== config.adminSecret) return null;
  await appendAudit(config.dataPaths.auditLog, {
    event: 'admin_login',
    actor: 'admin'
  });
  return issueToken({ sub: 'admin', role: roles.ADMIN });
}

function issueToken(payload, options = {}) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '4h', ...options });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function issueBiometricToken(studentId) {
  return issueToken(
    { sub: studentId, scope: 'biometric', role: roles.VOTER },
    { expiresIn: '10m' }
  );
}

export function verifyBiometricToken(token, expectedStudentId) {
  const decoded = verifyToken(token);
  if (decoded.scope !== 'biometric') {
    throw new Error('Invalid biometric token scope');
  }
  if (expectedStudentId && decoded.sub !== expectedStudentId) {
    throw new Error('Biometric token mismatch');
  }
  return decoded;
}

export async function registerVoteIssued(studentId) {
  const db = await getDb();
  const result = await db.run('UPDATE voters SET votedAt = ? WHERE studentId = ?', new Date().toISOString(), studentId);
  if (result.changes === 0) {
    throw new Error('Voter missing');
  }
}

