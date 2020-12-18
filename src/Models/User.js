module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        user_id: {
            type: DataTypes.STRING,
            unique: true,
            primaryKey: true,
        },
        fav_colour: {
            type: DataTypes.INTEGER,
            defaultValue: '0xFF6A39'
        }
    }, {
        timestamps: false,
    });
};