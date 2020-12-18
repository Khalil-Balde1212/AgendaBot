module.exports = (sequelize, DataTypes) => {
    return sequelize.define('courses', {
        user_id: {
            type: DataTypes.STRING,
        },
        course_name: {
            type: DataTypes.STRING
        },
        start_date: {type: DataTypes.STRING, defaultValue: 'No date inputted'},
        end_date: {type: DataTypes.STRING, defaultValue: 'No date inputted'}
    });    
};