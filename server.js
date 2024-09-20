import express from 'express';
import cors from 'cors';
import dotenv, { config } from 'dotenv';
import sequelize from './config/sequelize.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/postRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import './models/associations.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5050;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Welcome to the Facebook-like app API');
});

app.use('/VSAPI/V1/auth', authRoutes);
app.use('/VSAPI/V1/posts', postRoutes);
app.use('/VSAPI/V1/profile', profileRoutes);

sequelize.sync({ alter: true }) // Set force: true to drop and recreate tables every time
    .then(() => {
        console.log('PostgreSQL models synced and tables created');
    })
    .catch((error) => console.log('Error syncing Sequelize models:', error));

app.listen(port, () => {
    console.log(`Server is running on port  ${port}`);
});
