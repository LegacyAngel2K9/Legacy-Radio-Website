module.exports = (sequelize, Sequelize) => {
    const DiscountCode = require('./discountCode.model');
    const User = require('./user.model');
    
    const DiscountCodeUsage = sequelize.define("discountCodeUsage", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        discount_code_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: DiscountCode,
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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
        used_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    });

    DiscountCodeUsage.belongsTo(DiscountCode, { foreignKey: 'discount_code_id', as: 'discountCode' });
    DiscountCodeUsage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    return DiscountCodeUsage;
};
