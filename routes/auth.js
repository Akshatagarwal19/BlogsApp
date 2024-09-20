import express from 'express';
import jwt from 'jsonwebtoken';
import authController from '../controllers/authcontroller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;