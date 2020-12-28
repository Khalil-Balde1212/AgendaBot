module.exports = (sequelize, DataTypes) => {
    return sequelize.define('courses', {
        user_id: {
            type: DataTypes.STRING,
        },
        course_name: {
            type: DataTypes.STRING
        },
        start_date: {type: DataTypes.DATE, defaultValue: '0000-00-00 00:00'},
        end_date: {type: DataTypes.DATE, defaultValue: '0000-00-00 00:00'}
    });    
};