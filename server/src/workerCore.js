export async function processJob(job, deps) {
  const { aiProvider, ScreeningResult, submitAiFlag, completeJob, failJob } = deps;
  const question = job.payload?.question || { ilearnQuestionId: job.ilearn_question_id, qid: job.ilearn_question_id };
  const data = question.raw || question;
  data.qid = data.qid || job.ilearn_question_id;
  const result = await aiProvider.validateQuestion(data);
  if (!result || typeof result !== 'object') throw new Error('Malformed AI response');
  const status = result.status || 'NEEDS_REVIEW';
  const confidence = typeof result.confidence === 'number' ? Math.min(1, Math.max(0, result.confidence)) : null;
  const issue = Array.isArray(result.errors) && result.errors.length ? (result.errors[0].type || 'unknown') : null;
  const uncertain = !result.status || confidence === null;
  const finalStatus = uncertain ? 'NEEDS_REVIEW' : status;
  await ScreeningResult.create({
    job_id: job.id,
    ilearn_question_id: job.ilearn_question_id,
    issue_category: issue,
    screening_status: finalStatus,
    confidence,
    overall_explanation: result.explanation,
    raw_response: result.rawResponse || result,
    submission_status: 'not_submitted',
  });
  if (issue && !uncertain) {
    const enabled = process.env.ILEARN_FLAG_SUBMISSION_ENABLED === 'true';
    if (enabled) {
      await submitAiFlag({
        ilearnQuestionId: job.ilearn_question_id,
        issueType: issue.toLowerCase(),
        aiReason: result.explanation || 'AI detected issue',
        aiConfidence: confidence,
        validationReference: `job:${job.id}`,
      });
      await ScreeningResult.update({ submission_status: 'submitted' }, { where: { job_id: job.id } });
    }
  }
  await completeJob(job.id);
}
