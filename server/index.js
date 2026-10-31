import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import sequelize from './src/config/database.js';
import questionsRouter from './src/routes/questions.js';
import aiRouter from './src/routes/ai.js';
import configRouter from './src/routes/config.js';
import databaseRouter from './src/routes/database.js';
import questionsProxyRouter from './src/routes/questionsProxy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.use('/api/questions', questionsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/config', configRouter);
app.use('/api/database', databaseRouter);
app.use('/api/questions', questionsProxyRouter);

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
