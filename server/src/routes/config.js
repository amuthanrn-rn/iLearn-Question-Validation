import express from 'express';
import multer from 'multer';
import { loadConfig, saveConfig, parseEnvContent } from '../services/configStore.js';
import aiProvider from '../providers/deepseek.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 } });

router.get('/', (req, res) => {
  const config = loadConfig();
  res.json({
    provider: config.provider,
    hasApiKey: !!(config.deepseek?.apiKey && config.deepseek.apiKey.trim()),
    baseUrl: config.deepseek?.baseUrl || '',
    model: config.deepseek?.model || '',
    apiKeyMasked: config.deepseek?.apiKey ? '***' + config.deepseek.apiKey.slice(-4) : ''
  });
});

router.post('/env', upload.single('envFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const content = req.file.buffer.toString('utf8');
    const parsed = parseEnvContent(content);
    
    const config = loadConfig();
    if (parsed.DEEPSEEK_API_KEY) config.deepseek.apiKey = parsed.DEEPSEEK_API_KEY;
    if (parsed.DEEPSEEK_BASE_URL) config.deepseek.baseUrl = parsed.DEEPSEEK_BASE_URL;
    if (parsed.DEEPSEEK_MODEL) config.deepseek.model = parsed.DEEPSEEK_MODEL;
    
    saveConfig(config);
    res.json({ success: true, message: 'Configuration saved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/manual', (req, res) => {
  try {
    const { apiKey, baseUrl, model } = req.body;
    const config = loadConfig();
    if (apiKey !== undefined) config.deepseek.apiKey = apiKey;
    if (baseUrl) config.deepseek.baseUrl = baseUrl;
    if (model !== undefined) config.deepseek.model = model;
    saveConfig(config);
    res.json({ success: true, message: 'Configuration saved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/provider', (req, res) => {
  try {
    const { provider } = req.body;
    if (provider !== 'mock' && provider !== 'deepseek') {
      return res.status(400).json({ error: 'Invalid provider' });
    }
    const config = loadConfig();
    config.provider = provider;
    saveConfig(config);
    res.json({ success: true, provider });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/test', async (req, res) => {
  try {
    const config = loadConfig();
    if (config.provider === 'mock') {
      return res.json({ status: 'ok', provider: 'mock', message: 'Mock mode active' });
    }
    if (!config.deepseek.apiKey) {
      return res.status(400).json({ status: 'error', message: 'API key not configured' });
    }
    const result = await aiProvider.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
