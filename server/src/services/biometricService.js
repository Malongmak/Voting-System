import { createHash } from 'crypto';
import config from '../config.js';
import { getDb } from '../db.js';

const sanitizeSample = (sample) => {
  if (!sample) throw new Error('Biometric sample missing');
  return sample.includes(',')
    ? sample.split(',').pop()
    : sample;
};

const hashSample = (sampleBase64) => createHash('sha256').update(sampleBase64).digest('hex');

export async function verifyFaceSample(studentId, faceSampleBase64) {
  const db = await getDb();
  const voter = await db.get('SELECT faceTemplate FROM voters WHERE studentId = ?', studentId);
  if (!voter) throw new Error('Voter not found');
  if (!voter.faceTemplate) throw new Error('No enrolled biometric template for this voter');
  const sanitized = sanitizeSample(faceSampleBase64);
  const incomingHash = hashSample(sanitized);
  return incomingHash === voter.faceTemplate;
}

export async function enrollFaceTemplate(studentId, faceSampleBase64) {
  const db = await getDb();
  const voter = await db.get('SELECT studentId FROM voters WHERE studentId = ?', studentId);
  if (!voter) throw new Error('Voter not found');
  const sanitized = sanitizeSample(faceSampleBase64);
  await db.run('UPDATE voters SET faceTemplate = ? WHERE studentId = ?', hashSample(sanitized), studentId);
  return { studentId, enrolledAt: new Date().toISOString() };
}

