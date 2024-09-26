import express from 'express';
import commentController from '../controllers/commentcontroller.js';
import authenticate from '../middlewares/auth.js';

const router = express.Router();

router.post('/posts/:postId/comments', authenticate, commentController.addComment);
router.get('/posts/:postId/comments', commentController.getCommentsForPost);
router.delete('/comments/:commentId', authenticate, commentController.deleteComment);

export default router;