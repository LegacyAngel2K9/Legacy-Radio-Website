// require('dotenv').config();

// module.exports = {
//   HOST: process.env.DB_HOST || 'localhost',
//   USER: process.env.DB_USER || 'root',
//   PASSWORD: process.env.DB_PASS || 'password',
//   DB: process.env.DB_NAME || 'legacy_radio_db',
//   dialect: 'sqlite',
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };


require('dotenv').config();
const path = require('path');

module.exports = {
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || path.join(__dirname, '..', 'database.sqlite')
};
