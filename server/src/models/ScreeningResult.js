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
  processing_time_ms: DataTypes.INTEGER
}, {
  tableName: 'screening_results',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ScreeningResult;
