const pg = require('pg');

const dbPool = new pg.Pool({
	user: process.env.PGSQL_USER,
	database: process.env.PGSQL_DATABASE,
	password: process.env.PGSQL_PASSWORD,
	host: process.env.PGSQL_HOST, // Server hosting the postgres database
	port: process.env.PGSQL_PORT,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
});

class Data {
  constructor() {
    this.pool = dbPool;
  }

  connect(callback) {
    console.log("Connecting to PostgreSQL server " + process.env.PGSQL_HOST);

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