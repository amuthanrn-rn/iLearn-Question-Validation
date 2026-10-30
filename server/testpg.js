const { Sequelize } = require('sequelize');
const s = new Sequelize('postgres', 'postgres', 'postgres', {host:'localhost', port:5432, dialect:'postgres'});
s.authenticate().then(()=>{console.log('ok');process.exit(0);}).catch(e=>{console.log(e.message);process.exit(1);});
