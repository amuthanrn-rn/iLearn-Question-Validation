import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScreeningFailure = sequelize.define('ScreeningFailure', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  job_id: DataTypes.UUID,
  qid: DataTypes.BIGINT,
  error_type: DataTypes.ENUM('TIMEOUT', 'RATE_LIMIT', 'NETWORK_ERROR', 'INVALID_RESPONSE', 'PROVIDER_UNAVAILABLE', 'DB_WRITE_FAILURE', 'QUEUE_FAILURE', 'OTHER'),
  error_message: DataTypes.TEXT,
  attempt_count: { type: DataTypes.INTEGER, defaultValue: 1 },
  last_attempt_at: DataTypes.DATE,
  stack_trace: DataTypes.TEXT
}, {
  tableName: 'screening_failures',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ScreeningFailure;
