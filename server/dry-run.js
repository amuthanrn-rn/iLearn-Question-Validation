import dotenv from 'dotenv';
dotenv.config();
import { assertDevelopmentIntegrationEnv } from './src/config/envGuard.js';
import { getILearnSourceConfig, fetchILearnQuestionsPage, mapILearnQuestion } from './src/services/ilearnSourceService.js';
import { getPgConfigFromEnv, ensureJobTable, enqueueJob } from './src/services/jobQueue.js';

assertDevelopmentIntegrationEnv();
process.env.ILEARN_FLAG_SUBMISSION_ENABLED = 'false';

const maxQuestions = Number(process.argv[2] || 20);
const cfg = getILearnSourceConfig();
const pg = getPgConfigFromEnv();
await ensureJobTable(pg);

let enqueued = 0;
let page = 1;
while (enqueued < maxQuestions) {
  const res = await fetchILearnQuestionsPage({ page, pageSize: cfg.pageSize });
  for (const row of res.rows) {
    if (enqueued >= maxQuestions) break;
    const q = mapILearnQuestion(row);
    await enqueueJob(pg, q.ilearnQuestionId, { question: q });
    enqueued++;
    console.log(`Enqueued question ${q.ilearnQuestionId}`);
  }
  if (!res.hasMore) break;
  page++;
}
console.log(`Dry run enqueued ${enqueued} questions. Flag submission disabled.`);
