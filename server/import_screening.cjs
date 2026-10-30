const fs = require("fs");
const { Client } = require("pg");
const sql = fs.readFileSync("D:/AI Question Validation/reference-data/Screening-Findings sql.sql", "utf8");
const client = new Client({host:"localhost", port:5432, user:"postgres", password:"root", database:"ilearn"});
client.connect().then(async ()=>{
  const parts = sql.split(/;\r?\n/);
  let done = 0;
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i].trim();
    if (!t) continue;
    if (t.startsWith("--")) continue;
    const up = t.toUpperCase();
    if (up === "BEGIN" || up === "COMMIT") continue;
    if (up.startsWith("CREATE TABLE")) continue;
    try {
      await client.query(t);
      done++;
      if (done % 500 === 0) console.log(done);
    } catch(e) {
      console.error("ERR", e.message);
      await client.end();
      process.exit(1);
    }
  }
  console.log("total", done);
  await client.end();
}).catch(e=>{console.error(e);process.exit(1);});
