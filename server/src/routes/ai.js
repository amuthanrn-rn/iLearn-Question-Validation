import express from 'express';
import models from '../models/index.js';
import aiProvider from '../providers/deepseek.js';
import config from '../config/ai.js';

const router = express.Router();

router.get('/config', (req, res) => {
  res.json({
    provider: config.aiProvider,
    hasApiKey: !!config.deepseek.apiKey,
    model: config.deepseek.model || null
  });
});

router.get('/test', async (req, res) => {
  try {
    const result = await aiProvider.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/validate/:qid', async (req, res) => {
  try {
    const question = await models.ScreeningFindingsImport.findByPk(req.params.qid);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const result = await aiProvider.validateQuestion(question.toJSON());
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/validate-batch', async (req, res) => {
  try {
    const { qids } = req.body;
    if (!Array.isArray(qids)) {
      return res.status(400).json({ error: 'qids must be an array' });
    }
    
    const results = [];
    for (const qid of qids.slice(0, config.ai.batchSize)) {
      try {
        const question = await models.ScreeningFindingsImport.findByPk(qid);
        if (question) {
          const result = await aiProvider.validateQuestion(question.toJSON());
          results.push(result);
        }
      } catch (error) {
        results.push({ qid, status: 'FAILED', error: error.message });
      }
    }
    
    res.json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
