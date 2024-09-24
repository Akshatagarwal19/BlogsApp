import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/profile_photos');  // Adjust this path to where you store profile photos
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Ensure unique filenames
    }
});

const uploadMiddleware = multer({ storage });

export default uploadMiddleware;
