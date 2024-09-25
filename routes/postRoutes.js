import express from 'express';
import postController from '../controllers/postcontroller.js';
import authenticate from '../middlewares/auth.js';
import path from 'path';
import multer from 'multer';

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fileType = file.mimetype.split('/')[0]; 
        let folder = './uploads/media'; 

        if (fileType === 'video') folder = './uploads/videos';
        else if (fileType === 'image') folder = './uploads/images';
        else if (fileType === 'audio') folder = './uploads/audios';

        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|mkv|avi|jpg|jpeg|png|mp3|wav/; 
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (ext) {
            cb(null, true);
        } else {
            cb(new Error('Only video, image, and audio files are allowed'), false);
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// Routes
router.post('/upload', authenticate, upload.single('media'), postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.get('/stream/:id', authenticate, postController.streamPost);

export default router;
