module.exports = (sequelize, Sequelize) => {
    const DiscountCodeUsage = sequelize.define("discount_code_usages", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        discount_code_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'discount_codes',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
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
    }, {
        timestamps: false,
        tableName: 'discount_code_usages'
    });

    DiscountCodeUsage.associate = function(models) {
        DiscountCodeUsage.belongsTo(models.DiscountCode, { 
            foreignKey: 'discount_code_id', 
            as: 'discount_code',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        
        DiscountCodeUsage.belongsTo(models.User, { 
            foreignKey: 'user_id', 
            as: 'user',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return DiscountCodeUsage;
};