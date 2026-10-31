import test from 'node:test';
import assert from 'node:assert/strict';

test('processJob success', async () => {
  const { processJob } = await import('../src/workerCore.js');
  const saved = [];
  const deps = {
    aiProvider: { validateQuestion: async () => ({ status: 'CORRECT', confidence: 0.9, errors: [], explanation: 'ok' }) },
    ScreeningResult: { create: async (r) => { saved.push(r); return r; }, update: async () => {} },
    submitAiFlag: async () => ({ ok: true }),
    completeJob: async () => {},
  };
  process.env.ILEARN_FLAG_SUBMISSION_ENABLED = 'false';
  await processJob({ id: '1', ilearn_question_id: 1, payload: { question: { qid: 1 } }, attempts: 1 }, deps);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].screening_status, 'CORRECT');
});

test('processJob malformed throws', async () => {
  const { processJob } = await import('../src/workerCore.js');
  const deps = {
    aiProvider: { validateQuestion: async () => null },
    ScreeningResult: { create: async () => {}, update: async () => {} },
    submitAiFlag: async () => ({}),
    completeJob: async () => {},
  };
  await assert.rejects(() => processJob({ id: '2', ilearn_question_id: 2, payload: {}, attempts: 1 }, deps));
});

test('processJob needs review no flag', async () => {
  const { processJob } = await import('../src/workerCore.js');
  const flags = [];
  const deps = {
    aiProvider: { validateQuestion: async () => ({ status: null, confidence: null, errors: [{ type: 'X' }], explanation: 'uncertain' }) },
    ScreeningResult: { create: async (r) => r, update: async () => {} },
    submitAiFlag: async (p) => { flags.push(p); return {}; },
    completeJob: async () => {},
  };
  process.env.ILEARN_FLAG_SUBMISSION_ENABLED = 'true';
  await processJob({ id: '3', ilearn_question_id: 3, payload: {}, attempts: 1 }, deps);
  assert.equal(flags.length, 0);
});

test('processJob db failure throws', async () => {
  const { processJob } = await import('../src/workerCore.js');
  const deps = {
    aiProvider: { validateQuestion: async () => ({ status: 'INCORRECT', confidence: 0.8, errors: [{ type: 'WRONG_ANSWER' }], explanation: 'bad' }) },
    ScreeningResult: { create: async () => { throw new Error('db down'); }, update: async () => {} },
    submitAiFlag: async () => ({}),
    completeJob: async () => {},
  };
  process.env.ILEARN_FLAG_SUBMISSION_ENABLED = 'false';
  await assert.rejects(() => processJob({ id: '4', ilearn_question_id: 4, payload: {}, attempts: 1 }, deps), /db down/);
});

test('processJob flag enabled submits', async () => {
  const { processJob } = await import('../src/workerCore.js');
  const flags = [];
  const deps = {
    aiProvider: { validateQuestion: async () => ({ status: 'INCORRECT', confidence: 0.8, errors: [{ type: 'WRONG_ANSWER' }], explanation: 'bad' }) },
    ScreeningResult: { create: async (r) => r, update: async () => {} },
    submitAiFlag: async (p) => { flags.push(p); return { ok: true }; },
    completeJob: async () => {},
  };
  process.env.ILEARN_FLAG_SUBMISSION_ENABLED = 'true';
  await processJob({ id: '5', ilearn_question_id: 5, payload: {}, attempts: 1 }, deps);
  assert.equal(flags.length, 1);
});

