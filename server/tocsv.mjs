import xlsx from 'xlsx';
const wb = xlsx.readFile('D:/AI Question Validation/iLearn-AI-Validator/reference-data/Screening-Findings.xlsx');
xlsx.writeFile(wb, 'D:/AI Question Validation/iLearn-AI-Validator/reference-data/Screening-Findings.csv', {bookType:'csv'});
console.log('done');
