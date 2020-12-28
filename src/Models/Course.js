module.exports = (sequelize, DataTypes) => {
    return sequelize.define('courses', {
        user_id: {
            type: DataTypes.STRING,
        },
        course_name: {
            type: DataTypes.STRING
        },
        start_date: {type: DataTypes.DATEONLY, defaultValue: '00/00/0000'},
        end_date: {type: DataTypes.DATEONLY, defaultValue: '00/00/0000'}
    });    
};