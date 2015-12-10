import knex from 'knex';

class TokenStorage {

	/**
	* Setup TokenStorage. Connects to the database and creates the token table if it doesn't yet exist
	* @param params Object with setup paramaters.
	* Accepts the following parameters
	* - knex: An existing knex connection to be used for database connection
	* - dbHost: Database hostname to use if a knex connection has not been provided
	* - dbUser: Database user to use if a knex connection has not been provided
	* - dbPass: User password to use for database connection if a knex connection has not been provided
	* - dbName: Database to use if a knex connection has not been provided
	* - table: The table name to store tokens in. Defaults to "tokens"
	* - userCol: The column name used to store the username. Defaults to "user"
	* - hashCol: The column name used to store the token/hash. Defaults to "hash"
	* - expiryCol: The column name used to store the token expiry date/time. Defaults to "expiry"
	* - Duration: The amount of time in minutes that a token lasts for. Defaults to 24 hours (60 * 24)
	**/
	constructor(params) {
		this.table = params.table || 'tokens';
		this.userCol = params.userCol || 'user';
		this.hashCol = params.hashCol || 'hash';
		this.expiryCol = params.expiryCol || 'expiry';
		this.duration = params.duration || 60 * 24; 	// Duration in minutes, defaults to a day

		// Load the connection or create a new one
		if(params.knex) {
			this.knex = params.knex;
		} else {
			this.knex = knex({
				client: 'mysql',
				connection: {
					host: params.dbHost,
					user: params.dbUser,
					password: params.dbPass,
					database: params.dbName
				}
			});
		}

		// Create the table if it doesn't exist
		this.knex.schema.createTableIfNotExists(this.table, (table) => {
			table.increments();
			table.string(this.userCol);
			table.string(this.hashCol);
			table.dateTime(this.expiryCol);
		}).then(function(results) {
			true;	// Dunno why but I need this for schema callback to work
		});
	}

	/**
	* Insert the hash into the database for this user and set expiry
	* @param username The user this hash is stored for
	* @param hash The generated hash/token for this user
	**/
	saveHash(username, hash) {
		let expiry = new Date();
		expiry.setTime(Date.now() + (this.duration * 60000));
		let hashData = {};
		hashData[this.userCol] = username;
		hashData[this.hashCol] = hash;
		hashData[this.expiryCol] = expiry;
		this.knex(this.table).insert(hashData).then(function(results) {
			console.log(results);
		});
	}
	
	verifyHash(hash) {
		return this.knex(this.table)
		.where(this.hashCol, '=', hash)
		.where(this.expiryCol, '>', new Date())
		.select()
		.then((results) => {
			if(results.length) {
				return results[0][this.userCol];
			} else {
				return null;
			}
		});
	}


}
export default TokenStorage;
