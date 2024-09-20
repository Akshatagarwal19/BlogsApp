import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,// Logged sql queries for testing and debugging
});

sequelize.authenticate()
    .then(() => console.log('PostgreSQL connected successfully'))
    .catch((err) => console.error('PostgreSQL connection error:', err));

export default sequelize;
