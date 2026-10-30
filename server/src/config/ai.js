import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  PORT: z.string().default('5002'),
  AI_PROVIDER: z.enum(['mock', 'deepseek']).default('mock'),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().default('https://api.deepseek.com'),
  DEEPSEEK_MODEL: z.string().optional(),
  AI_REQUEST_TIMEOUT_MS: z.string().default('120000'),
  AI_MAX_RETRIES: z.string().default('3'),
  AI_VALIDATION_CONCURRENCY: z.string().default('2'),
  AI_VALIDATION_BATCH_SIZE: z.string().default('10')
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid configuration:', parsed.error.flatten());
  throw new Error('Configuration validation failed');
}

const config = parsed.data;

if (config.AI_PROVIDER === 'deepseek') {
  if (!config.DEEPSEEK_API_KEY || config.DEEPSEEK_API_KEY.trim() === '') {
    throw new Error('DEEPSEEK_API_KEY is required when AI_PROVIDER=deepseek');
  }
  if (!config.DEEPSEEK_MODEL || config.DEEPSEEK_MODEL.trim() === '') {
    throw new Error('DEEPSEEK_MODEL is required when AI_PROVIDER=deepseek');
  }
}

export default {
  port: parseInt(config.PORT),
  aiProvider: config.AI_PROVIDER,
  deepseek: {
    apiKey: config.DEEPSEEK_API_KEY || '',
    baseUrl: config.DEEPSEEK_BASE_URL,
    model: config.DEEPSEEK_MODEL || ''
  },
  ai: {
    timeoutMs: parseInt(config.AI_REQUEST_TIMEOUT_MS),
    maxRetries: parseInt(config.AI_MAX_RETRIES),
    concurrency: parseInt(config.AI_VALIDATION_CONCURRENCY),
    batchSize: parseInt(config.AI_VALIDATION_BATCH_SIZE)
  }
};
