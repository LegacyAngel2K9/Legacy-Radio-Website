const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

// Determine which environment we're in
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Initialize Sequelize with the appropriate config
let sequelize;
if (config.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: config.dialect,
    storage: config.storage,
    host: config.host,
    logging: config.logging
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: config.logging,
      dialectOptions: config.dialectOptions
    }
  );
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user.model.js')(sequelize, Sequelize);
db.Server = require('./server.model.js')(sequelize, Sequelize);
db.Subscriptions = require('./subscription.model.js')(sequelize, Sequelize);
db.DiscountCode = require('./discountCode.model.js')(sequelize, Sequelize);
db.DiscountCodeUsage = require('./discountCodeUsage.model.js')(sequelize, Sequelize);

// Define relationships
db.Subscriptions.belongsTo(db.User);
db.Subscriptions.belongsTo(db.Server);
db.DiscountCode.belongsTo(db.User);
db.DiscountCode.belongsTo(db.DiscountCodeUsage);
db.DiscountCodeUsage.belongsTo(db.User);

module.exports = db;