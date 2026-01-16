import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_DATABASE || 'hqtcsdl',
    process.env.DB_USERNAME || 'root',
    process.env.DB_PASSWORD || 'root123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test connection
sequelize.authenticate()
    .then(() => console.log(' Database connected successfully'))
    .catch((err) => console.error(' Database connection failed:', err)); 