import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PublicationChangeRequest = sequelize.define('PublicationChangeRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  qid: DataTypes.BIGINT,
  current_status: DataTypes.TEXT,
  proposed_status: DataTypes.ENUM('published', 'draft'),
  screening_result_id: DataTypes.UUID,
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  requested_by: DataTypes.STRING,
  reviewed_by: DataTypes.STRING,
  reviewed_at: DataTypes.DATE,
  remarks: DataTypes.TEXT
}, {
  tableName: 'publication_change_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default PublicationChangeRequest;
