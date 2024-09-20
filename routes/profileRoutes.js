import express, { Router } from 'express';
import authenticate from '../middlewares/auth.js';
import userController from '../controllers/usercontroller.js';

const router = express.Router();

router.get('/', authenticate, userController.isAdmin ,userController.getAllUsers);
router.get('/:id', authenticate, userController.isAdmin ,userController.getUserById);
router.put('/:id', authenticate, userController.isAdmin ,userController.updateProfile);
router.delete('/:id', authenticate, userController.isAdmin ,userController.deleteUser);

export default router;