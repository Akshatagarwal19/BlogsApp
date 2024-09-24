import express, { Router } from 'express';
import authenticate from '../middlewares/auth.js';
import userController from '../controllers/usercontroller.js';
import uploadMiddleware from '../middlewares/multer.js';

const router = express.Router();

router.get('/', authenticate, userController.isAdmin ,userController.getAllUsers);
router.get('/:id', authenticate, userController.isAdmin ,userController.getUserById);
router.put('/:id', authenticate, userController.isAdmin ,userController.updateProfile);
router.delete('/:id', authenticate, userController.isAdmin ,userController.deleteUser);
router.put('/:id/profile-photo', authenticate, uploadMiddleware.single('profilePhoto'), userController.updateProfile);

export default router;