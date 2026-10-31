import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/questions', async (req, res) => {
  const baseUrl = process.env.ILEARN_SOURCE_API_URL || process.env.ILEARN_DEV_API_BASE_URL;
  const token = process.env.ILEARN_SOURCE_API_TOKEN || process.env.ILEARN_DEV_API_TOKEN;
  if (!baseUrl || !token) {
    res.status(500).json({ success: false, message: 'iLearn source not configured' });
    return;
  }
  try {
    const upstream = await axios.get(`${baseUrl.replace(/\/$/, '')}/api/internal/ai-question-source`, {
      params: req.query,
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });
    res.json(upstream.data);
  } catch (e) {
    res.status(502).json({ success: false, message: 'Upstream error' });
  }
});

export default router;
