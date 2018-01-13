const pg = require('pg');
const dbPool = new pg.Pool();

class Data {
  constructor() {
    this.pool = dbPool;
  }

  connect(callback) {
    console.log("Connecting to PostgreSQL...");

    if (callback == null) {
      callback = () => {}
    }

    dbPool.connect().then(callback)
    .catch(() => {
      console.log("Unable to connect to database.")
    });

  }

  query(text, values, callback) {
    console.log('query:', text, values);
    return this.query(text, values, callback);
  }
}

module.exports = Data;