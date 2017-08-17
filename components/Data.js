const pg = require('pg');
var dbPool = new pg.Pool();

class Data {
  constructor() {
    console.log("Connecting to Postgresql...");
    dbPool.connect();
    console.log("Success!");
  }

  addUser(req, res) {
    console.log("Recieved new user.")
  }
}

module.exports = Data;