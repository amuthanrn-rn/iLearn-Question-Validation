export function assertDevelopmentIntegrationEnv() {
  const env = process.env.ILEARN_ENV || process.env.NODE_ENV || '';
  if (env !== 'development') throw new Error('iLearn integration is allowed only in development');
  const base = process.env.ILEARN_DEV_API_BASE_URL || '';
  if (!base) throw new Error('ILEARN_DEV_API_BASE_URL is required');
  if (/prod/i.test(base)) throw new Error('Production iLearn URL blocked');
  const dbHost = process.env.ILEARN_DEV_DB_HOST || '';
  if (dbHost && /prod/i.test(dbHost)) throw new Error('Production iLearn database host blocked');
}
