module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        user_id: {
            type: DataTypes.STRING,
            unique: true,
            primaryKey: true,
        },
        fav_colour: {
            type: DataTypes.INTEGER,
            defaultValue: 'FF6A39'
        },
        time_zone: {
            type: DataTypes.STRING,
            defaultValue: 'EST'
        }
    }, {
        timestamps: false,
    });
};