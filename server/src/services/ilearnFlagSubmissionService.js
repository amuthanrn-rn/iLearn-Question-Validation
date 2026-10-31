const issueTypes = new Set(['wrong_answer', 'typo', 'unclear', 'broken_image', 'other', 'duplicate', 'math_error', 'explanation_error']);

const IDEMPOTENCY = new Set();

export function validateFlagPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('payload required');
  const { ilearnQuestionId, issueType, aiReason, aiConfidence, validationReference } = payload;
  if (ilearnQuestionId === null || ilearnQuestionId === undefined || String(ilearnQuestionId).trim() === '') throw new Error('ilearnQuestionId required');
  if (!issueTypes.has(issueType)) throw new Error('invalid issueType');
  if (!aiReason || !String(aiReason).trim()) throw new Error('aiReason required');
  if (!validationReference || !String(validationReference).trim()) throw new Error('validationReference required');
  if (aiConfidence !== undefined && (typeof aiConfidence !== 'number' || aiConfidence < 0 || aiConfidence > 1)) throw new Error('invalid aiConfidence');
  return { ilearnQuestionId, issueType, aiReason, aiConfidence, validationReference };
}

export function getILearnFlagConfig() {
  const env = process.env.ILEARN_ENV || process.env.NODE_ENV;
  if (env !== 'development') throw new Error('iLearn integration requires ILEARN_ENV=development');
  const baseUrl = process.env.ILEARN_DEV_API_BASE_URL || '';
  const token = process.env.ILEARN_INTEGRATION_SERVICE_TOKEN || '';
  if (!baseUrl) throw new Error('ILEARN_DEV_API_BASE_URL is required');
  if (!token) throw new Error('ILEARN_INTEGRATION_SERVICE_TOKEN is required');
  if (/prod/i.test(baseUrl)) throw new Error('Production iLearn URL is not allowed');
  return { baseUrl, token, endpoint: process.env.ILEARN_FLAG_ENDPOINT || '/api/internal/ai-question-flags', timeout: Number(process.env.ILEARN_FLAG_TIMEOUT_MS || 30000) };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function submitAiFlag(payload, { idempotencyKey, maxRetries = 3 } = {}) {
  const data = validateFlagPayload(payload);
  const key = idempotencyKey || `${data.ilearnQuestionId}:${data.issueType}:${data.validationReference}`;
  if (IDEMPOTENCY.has(key)) return { skipped: true, reason: 'duplicate' };
  const cfg = getILearnFlagConfig();
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${cfg.endpoint}`;
  const body = {
    question_id: data.ilearnQuestionId,
    source: 'AI_VALIDATION',
    issue_type: data.issueType,
    ai_reason: data.aiReason,
    ai_confidence: data.aiConfidence ?? null,
    validation_reference: data.validationReference,
  };

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), cfg.timeout);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.token}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (res.ok) {
        IDEMPOTENCY.add(key);
        return await res.json();
      }
      if (res.status === 429 || res.status >= 500) {
        if (attempt === maxRetries) throw new Error(`HTTP ${res.status}`);
        await sleep(1000 * 2 ** attempt);
        attempt++;
        continue;
      }
      throw new Error(`Permanent HTTP ${res.status}`);
    } catch (e) {
      if (attempt === maxRetries) throw e;
      await sleep(1000 * 2 ** attempt);
      attempt++;
    }
  }
}
