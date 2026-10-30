const xlsx = require('xlsx');
const wb = xlsx.readFile('../reference-data/Screening-Findings.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const json = xlsx.utils.sheet_to_json(ws);
console.log(json.length);
