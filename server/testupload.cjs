const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const form = new FormData();
form.append('sqlFile', fs.createReadStream('../reference-data/Screening-Findings sql.sql'));
axios.post('http://localhost:5002/api/import/upload', form, { headers: form.getHeaders() })
  .then(r => { console.log(r.status); console.log(r.data); })
  .catch(e => { console.log('err'); console.log(e.response?.status); console.log(e.response?.data); });
