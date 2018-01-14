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

dbPool.on('error', function(err, client) {
	// if an error is encountered by a client while it sits idle in the pool
	// the pool itself will emit an error event with both the error and
	// the client which emitted the original error
	// this is a rare occurrence but can happen if there is a network partition
	// between your application and the database, the database restarts, etc.
	// and so you might want to handle it and at least log it out
	console.error('idle client error', err.message, err.stack);
});

class Data {
  constructor() {
    this.pool = dbPool;
  }

  // the query method is for passing queries to the pool
  query(text, values, callback) {
    console.log('query:', text, values);
    return this.pool.query(text, values, callback);
  }

  // the pool also supports checking out a client for
  // multiple operations, such as a transaction
  connect(callback) {
    this.pool.connect(callback);
  }
}

module.exports = Data;