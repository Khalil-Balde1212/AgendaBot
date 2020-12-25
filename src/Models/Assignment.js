module.exports = (sequelize, DataTypes) => {
    return sequelize.define('assignments', {
        user_id: {
            type: DataTypes.STRING
        },
        course_name: {type: DataTypes.STRING},
        title: {type: DataTypes.STRING},
        due_date: {
            type: DataTypes.DATE,
            defaultValue: 'No Due Date Set'
        },
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