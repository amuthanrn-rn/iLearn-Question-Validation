import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DBConnection = sequelize.define('DBConnection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: DataTypes.STRING,
  host: DataTypes.STRING,
  port: DataTypes.INTEGER,
  database: DataTypes.STRING,
  username: DataTypes.STRING,
  password: DataTypes.TEXT,
  ssl: DataTypes.BOOLEAN,
  status: DataTypes.ENUM('disconnected', 'connected', 'testing'),
  active: DataTypes.BOOLEAN,
  lastTestedAt: {
    type: DataTypes.DATE,
    field: 'last_tested_at'
  }
}, {
  tableName: 'db_connections',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default DBConnection;
