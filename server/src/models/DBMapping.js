import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DBMapping = sequelize.define('DBMapping', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  connectionId: DataTypes.UUID,
  schema: DataTypes.STRING,
  tableName: DataTypes.STRING,
  mappings: DataTypes.JSONB,
  active: DataTypes.BOOLEAN
}, {
  tableName: 'db_mappings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default DBMapping;
