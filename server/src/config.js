import { config } from 'dotenv';

config();

export default {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  adminSecret: process.env.ADMIN_SECRET || 'admin-master-key',
  electionId: process.env.ELECTION_ID || '2025-main',
  dataPaths: {
    voters: new URL('../data/voters.json', import.meta.url),
    ballots: new URL('../data/ballots.json', import.meta.url),
    auditLog: new URL('../data/audit.log', import.meta.url),
    keyPair: new URL('../data/keys.json', import.meta.url)
  }
};

