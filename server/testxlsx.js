const xlsx = require('xlsx');
const wb = xlsx.readFile('D:/AI Question Validation/iLearn-AI-Validator/reference-data/Screening-Findings.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const json = xlsx.utils.sheet_to_json(ws, {defval:null});
console.log(json[0].qid);
