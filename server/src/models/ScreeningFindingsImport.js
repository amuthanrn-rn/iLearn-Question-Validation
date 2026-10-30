import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ScreeningFindingsImport = sequelize.define('ScreeningFindingsImport', {
  qid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  answer_key: DataTypes.TEXT,
  solution_key_review_result: DataTypes.TEXT,
  review_status: DataTypes.TEXT,
  subject: DataTypes.TEXT,
  exam: DataTypes.TEXT,
  chapter: DataTypes.TEXT,
  screening_batch_existing_question_ordinal: DataTypes.TEXT,
  category: DataTypes.TEXT,
  deterministic_rules: DataTypes.TEXT,
  question_specific_finding_evidence: DataTypes.TEXT,
  publication_status_at_screening: DataTypes.TEXT,
  current_publication_status: DataTypes.TEXT,
  flag_status: DataTypes.TEXT,
  flag_id: DataTypes.BIGINT,
  action_in_this_10k_run: DataTypes.TEXT,
  exam_linked: DataTypes.TEXT,
  question: DataTypes.TEXT,
  options: DataTypes.TEXT,
  stored_explanation: DataTypes.TEXT,
  numeric_answer_policy: DataTypes.TEXT,
  original_review_status_context: DataTypes.TEXT,
  content_unchanged_since_screening: DataTypes.TEXT,
  screened_at_utc: DataTypes.TEXT,
  live_status_checked_at_utc: DataTypes.TEXT,
  reviewed_at_utc: DataTypes.DATE,
  question_url: DataTypes.TEXT
}, {
  tableName: 'screening_findings_import',
  schema: 'public',
  timestamps: false
});

export default ScreeningFindingsImport;
