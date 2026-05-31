const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '', // Try empty first
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected');
  connection.query('CREATE DATABASE IF NOT EXISTS tienda_virtual', (err, results) => {
    if (err) console.error(err);
    else console.log('Database created or already exists');
    connection.end();
  });
});
