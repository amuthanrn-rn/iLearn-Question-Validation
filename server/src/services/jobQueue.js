import { Client } from 'pg';

export function getPgConfigFromEnv(prefix = 'AI_VALIDATION') {
  return {
    host: process.env[`${prefix}_DB_HOST`] || process.env.DB_HOST,
    port: Number(process.env[`${prefix}_DB_PORT`] || process.env.DB_PORT || 5432),
    database: process.env[`${prefix}_DB_NAME`] || process.env.DB_NAME,
    user: process.env[`${prefix}_DB_USER`] || process.env.DB_USER,
    password: process.env[`${prefix}_DB_PASSWORD`] || process.env.DB_PASSWORD,
    ssl: (process.env[`${prefix}_DB_SSL`] || process.env.DB_SSL) === 'true' ? { rejectUnauthorized: false } : false,
  };
}

export async function ensureJobTable(config) {
  const client = new Client(config);
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS ai_validation_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ilearn_question_id BIGINT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      last_error TEXT,
      payload JSONB,
      next_retry_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      UNIQUE (ilearn_question_id)
    );
    CREATE INDEX IF NOT EXISTS ai_validation_jobs_status_idx ON ai_validation_jobs(status);
    CREATE INDEX IF NOT EXISTS ai_validation_jobs_retry_idx ON ai_validation_jobs(next_retry_at);
  `);
  await client.end();
}

let paused = false;
export function pauseQueue() { paused = true; }
export function resumeQueue() { paused = false; }
export function isQueuePaused() { return paused; }

export async function enqueueJob(config, ilearnQuestionId, payload = {}) {
  const client = new Client(config);
  await client.connect();
  await client.query(
    `INSERT INTO ai_validation_jobs (ilearn_question_id, payload)
     VALUES ($1, $2)
     ON CONFLICT (ilearn_question_id) DO NOTHING`,
    [ilearnQuestionId, payload],
  );
  await client.end();
}

export async function recoverStaleJobs(config, staleMinutes = 10) {
  const client = new Client(config);
  await client.connect();
  await client.query(`
    UPDATE ai_validation_jobs
    SET status = 'pending', updated_at = NOW()
    WHERE status = 'processing' AND updated_at < NOW() - ($1 || ' minutes')::interval
  `, [staleMinutes]);
  await client.end();
}

export async function claimNextJob(config) {
  if (paused) return null;
  const client = new Client(config);
  await client.connect();
  const res = await client.query(`
    UPDATE ai_validation_jobs
    SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
    WHERE id = (
      SELECT id FROM ai_validation_jobs
      WHERE status = 'pending'
        AND attempts < max_attempts
        AND (next_retry_at IS NULL OR next_retry_at <= NOW())
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *;
  `);
  await client.end();
  return res.rows[0] || null;
}

export async function completeJob(config, id) {
  const client = new Client(config);
  await client.connect();
  await client.query(`UPDATE ai_validation_jobs SET status='completed', completed_at=NOW(), updated_at=NOW() WHERE id=$1`, [id]);
  await client.end();
}

export async function failJob(config, id, error, attempt) {
  const client = new Client(config);
  await client.connect();
  const backoffMs = Math.min(60000, 1000 * 2 ** (attempt || 1));
  await client.query(`
    UPDATE ai_validation_jobs
    SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'pending' END,
        last_error = $2,
        next_retry_at = NOW() + ($3 || ' milliseconds')::interval,
        updated_at = NOW()
    WHERE id = $1
  `, [id, String(error), backoffMs]);
  await client.end();
}
