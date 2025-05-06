const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.users = require('./user.model.js')(sequelize, Sequelize);
db.server = require('./server.model.js')(sequelize, Sequelize);
db.subscriptions = require('./subscription.model.js')(sequelize, Sequelize);
db.discountCode = require('./discountCode.model.js')(sequelize, Sequelize);
db.discountCodeUsage = require('./discountCodeUsage.model.js')(sequelize, Sequelize);

// Define relationships
db.subscriptions.belongsTo(db.users);
db.subscriptions.belongsTo(db.server);
db.discountCode.belongsTo(db.users);
db.discountCode.belongsTo(db.discountCodeUsage);
db.discountCodeUsage.belongsTo(db.users);

module.exports = db;
