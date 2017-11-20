const pg = require('pg');
var dbPool = new pg.Pool();

class Data {
  constructor() {
    console.log("Connecting to Postgresql...");
    dbPool.connect()
      .then(console.log("Success!"))
      .catch(new Error("Unable to connect to database"));
    this.pool = dbPool;
  }
}

module.exports = Data;