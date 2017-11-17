const pg = require('pg');
var dbPool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rob',
  password: '',
  port: 5432
});

class Data {
  constructor() {
    console.log("Connecting to Postgresql...");
    dbPool.connect();
    console.log("Success!");
    this.pool = dbPool;
  }
}

module.exports = Data;