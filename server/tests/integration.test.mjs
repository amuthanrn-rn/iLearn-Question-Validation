import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFlagPayload } from '../src/services/ilearnFlagSubmissionService.js';
import { assertDevelopmentIntegrationEnv } from '../src/config/envGuard.js';

test('rejects missing question id', () => {
  assert.throws(() => validateFlagPayload({ issueType: 'wrong_answer', aiReason: 'x', validationReference: 'r' }));
});

test('rejects invalid issue type', () => {
  assert.throws(() => validateFlagPayload({ ilearnQuestionId: 1, issueType: 'bad', aiReason: 'x', validationReference: 'r' }));
});

test('accepts valid payload', () => {
  const d = validateFlagPayload({ ilearnQuestionId: 1, issueType: 'wrong_answer', aiReason: 'x', validationReference: 'r' });
  assert.equal(d.ilearnQuestionId, 1);
});

test('env guard blocks production', () => {
  process.env.ILEARN_ENV = 'development';
  process.env.ILEARN_DEV_API_BASE_URL = 'https://prod.example.com';
  assert.throws(() => assertDevelopmentIntegrationEnv());
});
