module.exports = (sequelize, Sequelize) => {
    const Server = sequelize.define("servers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    });

    Server.associate = (models) => {
        Server.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'SET NULL',
        });

        DiscountCode.hasMany(models.Server, { 
            foreignKey: 'server_id', 
            as: 'server'
        });
    };

    return Server;
};
