/** Database setup for BizTime. */

// db.js
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgresql/biztime',
});

client.connect();

module.exports = client;
