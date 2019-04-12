const mysql      = require('mysql');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'PASSWORD',
  database : 'Technoclap'
});
module.exports = db;