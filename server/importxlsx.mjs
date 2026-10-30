import xlsx from 'xlsx';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'root',
  database: 'ilearn'
});

const wb = xlsx.readFile('D:/AI Question Validation/iLearn-AI-Validator/reference-data/Screening-Findings.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const json = xlsx.utils.sheet_to_json(ws);

const client = await pool.connect();
try {
  for (let i = 0; i < json.length; i++) {
    const row = json[i];
    await client.query("INSERT INTO public.screening_findings_import (qid) VALUES ()", [row.qid]).catch(()=>{});
  }
  const res = await client.query('SELECT COUNT(*) FROM public.screening_findings_import');
  console.log(res.rows[0].count);
} finally {
  client.release();
  await pool.end();
}
