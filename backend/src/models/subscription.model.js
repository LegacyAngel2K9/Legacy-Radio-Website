module.exports = (sequelize, Sequelize) => {
  const User = require('./user.model');
  const Server = require('./server.model');

  const Subscription = sequelize.define("subscription", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    server_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: Server,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    startDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    endDate: {
      type: Sequelize.DATE
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    via_coupon: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Subscription.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });

  return Subscription;
};
