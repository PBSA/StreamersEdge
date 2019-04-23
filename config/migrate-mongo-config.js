const config = require('config');

const {
	user, password, host, port, database,
} = config.db;

module.exports = {
	mongodb: {
		url: `mongodb://${(user) ? (`${user}:${password}@`) : ''}${host}:${port}`,
		databaseName: database,
		options: {
			useNewUrlParser: true,
		},
	},
	migrationsDir: 'migrations',
	changelogCollectionName: 'changelog',
};
