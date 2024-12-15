// Database connection and configuration mysql with sequelize
// Path: src/database/database.js
import Sequelize from 'sequelize';
import config from '../config.js';
export const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
        host: config.development.host,
        port: config.development.port,
        dialect: config.development.dialect,
        pool: {
            max: 5,
            min: 0,
            require: 30000,
            idle: 10000
        },
        logging: false
    }
);
