const pg = require('pg');
var dbPool = new pg.Pool({
  user: process.env.PGSQL_USER,
  host: process.env.PGSQL_HOST,
  database: process.env.PGSQL_DATABASE,
  password: process.env.PGSQL_PASSWORD,
  port: process.env.PGSQL_PORT
});

class Data {
  constructor() {
    console.log("Connecting to Postgresql...");
    dbPool.connect()
      .then(console.log("Success!"))
      .catch(new Error("Unable to connect to database"));
    ;
    this.pool = dbPool;
  }
}

module.exports = Data;