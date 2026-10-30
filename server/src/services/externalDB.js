import { Client } from 'pg';

export async function testConnection(config) {
  const client = new Client({
    host: config.host,
    port: config.port || 5432,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
  });
  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return { success: true };
  } catch (error) {
    await client.end().catch(() => {});
    throw error;
  }
}

export async function getSchemasAndTables(config) {
  const client = new Client({
    host: config.host,
    port: config.port || 5432,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false
  });
  await client.connect();
  const res = await client.query("SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY schemaname, tablename");
  await client.end();
  return res.rows;
}

export async function getTableColumns(config, schema, table) {
  const client = new Client({
    host: config.host,
    port: config.port || 5432,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false
  });
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema =  AND table_name =  ORDER BY ordinal_position", [schema, table]);
  await client.end();
  return res.rows;
}

export async function fetchQuestions(config, schema, table, mapping, limit = 20, offset = 0) {
  const client = new Client({
    host: config.host,
    port: config.port || 5432,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false
  });
  await client.connect();
  const query = 'SELECT * FROM "' + schema + '"."' + table + '" LIMIT ' + limit + ' OFFSET ' + offset;
  const res = await client.query(query);
  await client.end();
  return res.rows;
}
