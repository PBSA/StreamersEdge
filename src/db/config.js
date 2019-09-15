const config = require('config');
module.exports = {
  username: config.db.user,
  password: config.db.password,
  host: config.db.host,
  database: config.db.database,
  port: config.db.port,
  dialect: 'postgres'
};
