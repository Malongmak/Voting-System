import express from 'express';
import cors from 'cors';
import config from './config.js';
import authRoutes from './routes/authRoutes.js';
import ballotRoutes from './routes/ballotRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import biometricRoutes from './routes/biometricRoutes.js';
import registerRoutes from './routes/registerRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', electionId: config.electionId }));

app.use('/api/auth', authRoutes);
app.use('/api/ballots', ballotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth/biometric', biometricRoutes);
app.use('/api/register', registerRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Election backend running on port ${config.port}`);
});

