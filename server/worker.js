import dotenv from 'dotenv';
dotenv.config();
import { assertDevelopmentIntegrationEnv } from './src/config/envGuard.js';
import { getPgConfigFromEnv, ensureJobTable, recoverStaleJobs, claimNextJob, completeJob, failJob, pauseQueue, resumeQueue, isQueuePaused } from './src/services/jobQueue.js';
import aiProvider from './src/providers/deepseek.js';
import ScreeningResult from './src/models/ScreeningResult.js';
import { submitAiFlag } from './src/services/ilearnFlagSubmissionService.js';
import { processJob as runProcessJob } from './src/workerCore.js';

assertDevelopmentIntegrationEnv();

const cfg = getPgConfigFromEnv();
const POLL_MS = Number(process.env.WORKER_POLL_MS || 1000);
let running = true;
process.on('SIGINT', () => { running = false; });
process.on('SIGTERM', () => { running = false; });

const deps = { aiProvider, ScreeningResult, submitAiFlag, completeJob: (id) => completeJob(cfg, id), failJob: (id, e, a) => failJob(cfg, id, e, a) };

export async function processJob(job) { return runProcessJob(job, deps); }

async function main() {
  await ensureJobTable(cfg);
  await recoverStaleJobs(cfg);
  while (running) {
    if (isQueuePaused()) { await new Promise(r => setTimeout(r, POLL_MS)); continue; }
    const job = await claimNextJob(cfg);
    if (!job) { await new Promise(r => setTimeout(r, POLL_MS)); continue; }
    try { await processJob(job); }
    catch (e) { await failJob(cfg, job.id, e.message, job.attempts); }
    await new Promise(r => setTimeout(r, Number(process.env.WORKER_RATE_LIMIT_MS || 250)));
  }
}

if (process.env.WORKER_AUTOSTART !== 'false') {
  main().catch(e => { console.error(e); process.exit(1); });
}

export { pauseQueue, resumeQueue, isQueuePaused };
