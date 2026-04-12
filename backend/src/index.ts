import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { apiRateLimit } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import publicRoutes from './routes/public';
import recruiterRoutes from './routes/recruiter';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(apiRateLimit);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n100x Socials API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health\n`);
});

export default app;
