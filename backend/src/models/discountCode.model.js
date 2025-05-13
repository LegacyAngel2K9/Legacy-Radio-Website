module.exports = (sequelize, Sequelize) => {
    const DiscountCode = sequelize.define("discount_codes", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        server_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'servers',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        expires_at: {
            type: Sequelize.DATE,
            allowNull: true,
            validate: {
                isDate: true
            }
        },
        max_uses: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: {
                min: 1
            }
        },
        created_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    }, {
        timestamps: false,
        tableName: 'discount_codes'
    });

    // Class method for associations
    DiscountCode.associate = function(models) {
        DiscountCode.belongsTo(models.Server, { 
            foreignKey: 'server_id', 
            as: 'server',
            constraints: false
        });
        
        DiscountCode.belongsTo(models.User, { 
            foreignKey: 'created_by', 
            as: 'creator',
            constraints: false
        });
        
        DiscountCode.hasMany(models.DiscountCodeUsage, { 
            foreignKey: 'discount_code_id', 
            as: 'usages' 
        });
    };

    return DiscountCode;
};