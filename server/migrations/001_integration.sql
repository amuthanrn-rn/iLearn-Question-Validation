-- Migration: queue + screening uniqueness (non-destructive)
CREATE TABLE IF NOT EXISTS ai_validation_jobs (...);
ALTER TABLE screening_results ADD COLUMN IF NOT EXISTS ilearn_question_id BIGINT;
ALTER TABLE screening_results ADD COLUMN IF NOT EXISTS issue_category VARCHAR(64);
ALTER TABLE screening_results ADD COLUMN IF NOT EXISTS submission_status VARCHAR(20) DEFAULT 'not_submitted';
CREATE UNIQUE INDEX IF NOT EXISTS screening_results_ilearn_issue_unique ON screening_results(ilearn_question_id, issue_category);
