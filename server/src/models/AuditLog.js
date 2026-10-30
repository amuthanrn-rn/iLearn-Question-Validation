import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  action: DataTypes.STRING,
  entity_type: DataTypes.STRING,
  entity_id: DataTypes.STRING,
  user_id: DataTypes.STRING,
  details: DataTypes.JSONB,
  ip_address: DataTypes.STRING
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default AuditLog;
