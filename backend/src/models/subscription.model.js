module.exports = (sequelize, Sequelize) => {
  const Subscription = sequelize.define("subscriptions", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Use table name here instead of model reference
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    server_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'servers', // Use table name here instead of model reference
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    start_date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    end_date: {
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

  Subscription.associate = function(models) {
    Subscription.belongsTo(models.User, { foreignKey: 'user_id', as: 'users' });
    Subscription.belongsTo(models.Server, { foreignKey: 'server_id', as: 'servers' });
  };

  return Subscription;
};