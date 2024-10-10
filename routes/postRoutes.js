import express from 'express';
import postController from '../controllers/postcontroller.js';
import authenticate from '../middlewares/auth.js';
import uploadMiddleware from '../middlewares/multer.js'; // Using the updated Cloudinary-based multer

const router = express.Router();

// Routes
router.post('/upload', authenticate, uploadMiddleware.single('media'), postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.get('/stream/:id', authenticate, postController.streamPost);

export default router;
