module.exports = (sequelize, DataTypes) => {
    return sequelize.define('assignments', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        course_name: {type: DataTypes.STRING},
        title: {type: DataTypes.STRING},
        due_date: {type: DataTypes.STRING},
        complete: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        remind_me: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
};