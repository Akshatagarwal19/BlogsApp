import express from 'express';
import cors from 'cors';
import dotenv, { config } from 'dotenv';
import sequelize from './config/sequelize.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/postRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import './models/associations.js';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongoose.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

const port = process.env.PORT || 5050;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Welcome to the Blogs app API');
});
app.use('/VSAPI/V1/auth', authRoutes);
app.use('/VSAPI/V1/posts', postRoutes);
app.use('/VSAPI/V1/profile', profileRoutes);
app.use('/VSAPI/V1/comments', commentRoutes);

sequelize.sync({ alter: true }) 
    .then(() => {
        console.log('PostgreSQL models synced and tables created');
    })
    .catch((error) => console.log('Error syncing Sequelize models:', error));

app.listen(port, () => {
    console.log(`Server is running on port  ${port}`);
});
