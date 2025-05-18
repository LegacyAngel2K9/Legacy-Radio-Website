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
db.Subscriptions = require('./Subscription.model.js')(sequelize, Sequelize);
db.DiscountCode = require('./discountCode.model.js')(sequelize, Sequelize);
db.DiscountCodeUsage = require('./discountCodeUsage.model.js')(sequelize, Sequelize);

// Define relationships
db.Server.belongsTo(db.User, {
  foreignKey: "user_id",
  as: 'user'
});

db.User.hasMany(db.Server, {
  foreignKey: 'user_id',
  as: 'servers'
});

db.Subscriptions.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});
db.User.hasMany(db.Subscriptions, {
  foreignKey: 'user_id',
  as: 'Subscriptions'
});

db.Subscriptions.belongsTo(db.Server, {
  foreignKey: 'server_id',
  as: 'server'
});
db.Server.hasMany(db.Subscriptions, {
  foreignKey: 'server_id',
  as: 'Subscriptions'
});

db.DiscountCode.belongsTo(db.User, {
  foreignKey: 'created_by',
  as: 'creator'
});
db.User.hasMany(db.DiscountCode, {
  foreignKey: 'created_by',
  as: 'discountCodes'
});

db.DiscountCode.belongsTo(db.Server, {
  foreignKey: 'server_id',
  as: 'server'
});
db.Server.hasMany(db.DiscountCode, {
  foreignKey: 'server_id',
  as: 'discountCodes'
});

// A DiscountCode has many usages
db.DiscountCode.hasMany(db.DiscountCodeUsage, {
  foreignKey: 'discount_code_id',
  as: 'discount_code_usages'
});
db.DiscountCodeUsage.belongsTo(db.DiscountCode, {
  foreignKey: 'discount_code_id',
  as: 'discountCode'
});

// A DiscountCodeUsage belongs to a User
db.DiscountCodeUsage.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});
db.User.hasMany(db.DiscountCodeUsage, {
  foreignKey: 'user_id',
  as: 'discountCodeUsages'
});

module.exports = db;