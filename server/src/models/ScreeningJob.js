import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScreeningJob = sequelize.define('ScreeningJob', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'paused', 'completed', 'failed', 'terminated'),
    defaultValue: 'pending'
  },
  total_questions: DataTypes.INTEGER,
  processed: { type: DataTypes.INTEGER, defaultValue: 0 },
  successful: { type: DataTypes.INTEGER, defaultValue: 0 },
  failed: { type: DataTypes.INTEGER, defaultValue: 0 },
  needs_review: { type: DataTypes.INTEGER, defaultValue: 0 },
  incorrect: { type: DataTypes.INTEGER, defaultValue: 0 },
  correct: { type: DataTypes.INTEGER, defaultValue: 0 },
  filters: DataTypes.JSONB,
  config: DataTypes.JSONB,
  started_at: DataTypes.DATE,
  completed_at: DataTypes.DATE
}, {
  tableName: 'screening_jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ScreeningJob;
