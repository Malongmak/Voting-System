import { v4 as uuid } from 'uuid';
import config from '../config.js';
import { loadJson, saveJson, appendAudit } from '../utils/fileStore.js';
import { encryptBallotPayload, decryptBallotPayload } from './cryptoService.js';

export async function submitBallot(studentId, selections) {
  const ballots = await loadJson(config.dataPaths.ballots, []);
  const existing = ballots.find((ballot) => ballot.studentId === studentId);
  if (existing) {
    throw new Error('Duplicate vote detected');
  }

  const encryptedPayload = await encryptBallotPayload({ selections, studentId, electionId: config.electionId });
  const ballot = {
    id: uuid(),
    studentId,
    encryptedPayload,
    submittedAt: new Date().toISOString()
  };
  ballots.push(ballot);
  await saveJson(config.dataPaths.ballots, ballots);
  await appendAudit(config.dataPaths.auditLog, {
    event: 'ballot_submitted',
    actor: studentId,
    ballotId: ballot.id
  });
  return { ballotId: ballot.id };
}

export async function listBallots() {
  return loadJson(config.dataPaths.ballots, []);
}

export async function decryptAllBallots() {
  const ballots = await listBallots();
  return Promise.all(ballots.map(async (ballot) => ({
    ...ballot,
    decrypted: await decryptBallotPayload(ballot.encryptedPayload)
  })));
}

