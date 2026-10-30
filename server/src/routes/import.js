import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import models from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

const jobs = new Map();

router.post('/upload', upload.single('sqlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const jobId = Date.now().toString();
    jobs.set(jobId, { status: 'importing', file: req.file.filename, startedAt: new Date() });
    
    res.json({
      success: true,
      jobId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      message: 'File uploaded. Starting import...'
    });
    
    // Try to import using psql if available
    setTimeout(async () => {
      try {
        const filePath = req.file.path;
        const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
        const cmd = '"' + psqlPath + '" -U postgres -h localhost -d ilearn -f "' + filePath.replace(/\\/g, '\\\\') + '"';
        exec(cmd, { env: { ...process.env, PGPASSWORD: 'root' } }, (err, stdout, stderr) => {
          if (err) {
            jobs.set(jobId, { status: 'failed', error: stderr || err.message });
          } else {
            jobs.set(jobId, { status: 'completed', stdout: stdout.slice(0, 200) });
          }
        });
      } catch (e) {
        jobs.set(jobId, { status: 'failed', error: e.message });
      }
    }, 100);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

router.get('/tables', async (req, res) => {
  try {
    const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'ilearn' });
    await client.connect();
    const result = await client.query("SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    await client.end();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
