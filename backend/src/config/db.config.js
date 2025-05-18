require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    host: "./dev.sqlite",
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: console.log
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Only set to false if using self-signed certs
      }
    }
  }
};