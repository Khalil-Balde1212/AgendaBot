const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('my-sql-database', 'root', 'root', {
    host: '35.225.20.169',
    dialect: 'mysql'
});

try {
    sequelize.authenticate().then(() => {
        console.log('Connection has been established successfully.');
    })
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
