const fs = require("fs");
const { Client } = require("pg");
let sql = fs.readFileSync("D:/AI Question Validation/reference-data/Screening-Findings sql.sql", "utf8");
sql = sql.replace(/'Historical timestamp not recorded'::timestamptz/g, "NULL");
sql = sql.replace(/'Historical timestamp not recorded'/g, "NULL");
// Try to fix - just process all INSERT statements properly
const client = new Client({host:"localhost", port:5432, user:"postgres", password:"root", database:"ilearn"});
client.connect().then(async ()=>{
  // Use simpler split approach
  const regex = /INSERT INTO[^\;]+\;/gs;
  const matches = sql.match(regex);
  if (!matches) { console.log("no matches"); process.exit(0); }
  console.log("found", matches.length);
  let done = 0;
  for (let i = 0; i < matches.length; i++) {
    try {
      await client.query(matches[i]);
      done++;
      if (done % 200 === 0) console.log(done);
    } catch(e) {
      console.error("ERR", i, e.message.substring(0,60));
      // continue
    }
  }
  console.log("total", done);
  await client.end();
}).catch(e=>{console.error(e);process.exit(1);});
