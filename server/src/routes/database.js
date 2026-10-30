import express from 'express';
import models from '../models/index.js';
import { testConnection, getSchemasAndTables, getTableColumns, fetchQuestions } from '../services/externalDB.js';

const router = express.Router();

router.post('/test', async (req, res) => {
  try {
    const result = await testConnection(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/connections', async (req, res) => {
  try {
    await testConnection(req.body);
    const conn = await models.DBConnection.create({
      name: req.body.name || 'iLearn DB',
      host: req.body.host,
      port: req.body.port,
      database: req.body.database,
      username: req.body.username,
      password: req.body.password,
      ssl: req.body.ssl,
      status: 'connected',
      active: true
    });
    res.json({ success: true, id: conn.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/connections', async (req, res) => {
  try {
    const conns = await models.DBConnection.findAll({ order: [['created_at', 'DESC']] });
    const safe = conns.map(c => ({ id: c.id, name: c.name, host: c.host, port: c.port, database: c.database, username: c.username, status: c.status, active: c.active }));
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const conn = await models.DBConnection.findOne({ where: { active: true } });
    if (!conn) return res.json({ connected: false });
    res.json({ connected: true, name: conn.name, database: conn.database });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/disconnect', async (req, res) => {
  try {
    await models.DBConnection.update({ active: false, status: 'disconnected' }, { where: {} });
    await models.DBMapping.update({ active: false }, { where: {} });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tables', async (req, res) => {
  try {
    const conn = await models.DBConnection.findOne({ where: { active: true } });
    if (!conn) return res.status(400).json({ error: 'No active connection' });
    const tables = await getSchemasAndTables(conn.toJSON());
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/columns', async (req, res) => {
  try {
    const conn = await models.DBConnection.findOne({ where: { active: true } });
    if (!conn) return res.status(400).json({ error: 'No active connection' });
    const { schema, table } = req.query;
    const columns = await getTableColumns(conn.toJSON(), schema, table);
    res.json(columns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mapping', async (req, res) => {
  try {
    const conn = await models.DBConnection.findOne({ where: { active: true } });
    if (!conn) return res.status(400).json({ error: 'No active connection' });
    const mapping = await models.DBMapping.create({
      connectionId: conn.id,
      schema: req.body.schema,
      tableName: req.body.table,
      mappings: req.body.mappings,
      active: true
    });
    res.json({ success: true, id: mapping.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/preview', async (req, res) => {
  try {
    const conn = await models.DBConnection.findOne({ where: { active: true } });
    const map = await models.DBMapping.findOne({ where: { active: true } });
    if (!conn || !map) return res.status(400).json({ error: 'Not configured' });
    const rows = await fetchQuestions(conn.toJSON(), map.schema, map.tableName, map.mappings, 10, 0);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/activate', async (req, res) => {
  try {
    await models.DBMapping.update({ active: true }, { where: { id: req.body.mappingId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
