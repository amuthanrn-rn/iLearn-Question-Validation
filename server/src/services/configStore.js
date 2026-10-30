import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '../data/ai-config.enc');
const KEY_FILE = path.join(__dirname, '../data/.key');

function getKey() {
  if (fs.existsSync(KEY_FILE)) {
    return fs.readFileSync(KEY_FILE);
  }
  const key = crypto.randomBytes(32);
  fs.writeFileSync(KEY_FILE, key);
  return key;
}

export function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return { provider: 'mock', deepseek: { apiKey: '', baseUrl: 'https://api.deepseek.com', model: '' } };
    }
    const key = getKey();
    const data = fs.readFileSync(CONFIG_FILE);
    const iv = data.slice(0, 16);
    const encrypted = data.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (e) {
    return { provider: 'mock', deepseek: { apiKey: '', baseUrl: 'https://api.deepseek.com', model: '' } };
  }
}

export function saveConfig(config) {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const json = JSON.stringify(config);
  let encrypted = cipher.update(json);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  fs.writeFileSync(CONFIG_FILE, Buffer.concat([iv, encrypted]));
}

export function parseEnvContent(content) {
  const parsed = dotenv.parse(content);
  const allowed = ['DEEPSEEK_API_KEY', 'DEEPSEEK_BASE_URL', 'DEEPSEEK_MODEL'];
  const result = {};
  for (const key of allowed) {
    if (parsed[key] !== undefined) {
      result[key] = parsed[key];
    }
  }
  if (parsed.DEEPSEEK_API_KEY && parsed.DEEPSEEK_API_KEY.trim() === '') {
    throw new Error('Invalid API key');
  }
  return result;
}
