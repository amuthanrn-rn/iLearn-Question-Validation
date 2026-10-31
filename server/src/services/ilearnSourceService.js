export function getILearnSourceConfig() {
  return {
    mode: process.env.ILEARN_SOURCE_MODE || 'postgres',
    apiBaseUrl: process.env.ILEARN_SOURCE_API_URL || process.env.ILEARN_DEV_API_BASE_URL || '',
    apiToken: process.env.ILEARN_SOURCE_API_TOKEN || process.env.ILEARN_DEV_API_TOKEN || '',
    pageSize: Number(process.env.ILEARN_SOURCE_PAGE_SIZE || 20),
  };
}

export async function fetchILearnQuestionsPage({ page = 1, pageSize, subjectId, questionId } = {}) {
  const cfg = getILearnSourceConfig();
  const limit = Math.min(pageSize || cfg.pageSize, 100);
  const offset = (page - 1) * limit;
  if (cfg.mode !== 'api') throw new Error('ILEARN_SOURCE_MODE must be api');
  const url = new URL(`${cfg.apiBaseUrl.replace(/\/$/, '')}/api/internal/ai-question-source`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  if (subjectId) url.searchParams.set('subject_id', String(subjectId));
  if (questionId) url.searchParams.set('question_id', String(questionId));
  const res = await fetch(url.toString(), {
    headers: cfg.apiToken ? { Authorization: `Bearer ${cfg.apiToken}` } : {},
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`iLearn source API failed: ${res.status}`);
  const data = await res.json();
  return { rows: data.data || [], total: data.pagination?.total || null, hasMore: data.pagination?.has_more || false, page, pageSize: limit };
}

export function mapILearnQuestion(row) {
  return { ilearnQuestionId: row.question_id, subject: row.subject_name, raw: row };
}
