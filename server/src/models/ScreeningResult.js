import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScreeningResult = sequelize.define('ScreeningResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  job_id: DataTypes.UUID,
  qid: DataTypes.BIGINT,
  ilearn_question_id: DataTypes.BIGINT,
  issue_category: DataTypes.STRING(64),
  screening_status: DataTypes.ENUM('CORRECT', 'INCORRECT', 'NEEDS_REVIEW', 'UNDETERMINED', 'FAILED'),
  question_check: DataTypes.ENUM('CORRECT', 'INCORRECT', 'NEEDS_REVIEW'),
  options_check: DataTypes.ENUM('CORRECT', 'INCORRECT', 'NEEDS_REVIEW'),
  answer_check: DataTypes.ENUM('CORRECT', 'INCORRECT', 'NEEDS_REVIEW'),
  explanation_check: DataTypes.ENUM('CORRECT', 'INCORRECT', 'NEEDS_REVIEW'),
  subject_check: DataTypes.ENUM('CORRECT', 'INCORRECT', 'NEEDS_REVIEW'),
  chapter_check: DataTypes.ENUM('CORRECT', 'INCORRECT', 'NEEDS_REVIEW'),
  stored_answer: DataTypes.TEXT,
  ai_derived_answer: DataTypes.TEXT,
  confidence: DataTypes.FLOAT,
  errors: DataTypes.JSONB,
  overall_explanation: DataTypes.TEXT,
  proposed_publication_status: DataTypes.ENUM('published', 'draft'),
  requires_human_review: DataTypes.BOOLEAN,
  raw_response: DataTypes.JSONB,
  processing_time_ms: DataTypes.INTEGER,
  submission_status: DataTypes.ENUM('not_submitted', 'submitted', 'failed', 'skipped'),
  submission_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_submission_error: DataTypes.TEXT,
}, {
  tableName: 'screening_results',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['ilearn_question_id', 'issue_category'], name: 'screening_results_ilearn_issue_unique' },
  ],
});

export default ScreeningResult;
