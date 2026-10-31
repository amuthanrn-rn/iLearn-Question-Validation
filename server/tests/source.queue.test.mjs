import test from 'node:test';
import assert from 'node:assert/strict';

test('fetch page and preserve ids', async () => {
  global.fetch = async () => ({ ok: true, json: async () => ({ data: [{ question_id: 1 }, { question_id: 2 }], pagination: { total: 2, has_more: false } }) });
  const { fetchILearnQuestionsPage } = await import('../src/services/ilearnSourceService.js');
  process.env.ILEARN_SOURCE_MODE = 'api';
  process.env.ILEARN_SOURCE_API_URL = 'http://localhost';
  process.env.ILEARN_SOURCE_API_TOKEN = 't';
  const res = await fetchILearnQuestionsPage({ page: 1, pageSize: 2 });
  assert.equal(res.rows.length, 2);
  assert.equal(res.rows[0].question_id, 1);
});

test('pause/resume queue', async () => {
  const { pauseQueue, resumeQueue, isQueuePaused } = await import('../src/services/jobQueue.js');
  pauseQueue();
  assert.equal(isQueuePaused(), true);
  resumeQueue();
  assert.equal(isQueuePaused(), false);
});
