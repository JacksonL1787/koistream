require('dotenv').config()
const knex = require("knex");

module.exports = {
	reader: knex({
		client: "pg",
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			database: process.env.DB_NAME,
			password: process.env.DB_PASS
		}
  	}),
	writer: knex({
		client: "pg",
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			database: process.env.DB_NAME,
			password: process.env.DB_PASS
		}
	})
};
