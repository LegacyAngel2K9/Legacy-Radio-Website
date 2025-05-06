module.exports = (sequelize, Sequelize) => {
    const Server = require('./server.model');
    const User = require('./user.model');
    
    const DiscountCode = sequelize.define("discountCode", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        server_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: Server,
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        expires_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        max_uses: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        created_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: User,
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    });

    DiscountCode.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });
    DiscountCode.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    DiscountCode.hasMany(require('./discountCodeUsage.model'), { foreignKey: 'discount_code_id', as: 'usages' });

    return DiscountCode;
};
