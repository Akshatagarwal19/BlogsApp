import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryModule from 'cloudinary';

const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_media', // Folder where media will be stored in Cloudinary
    allowed_formats: ['jpg', 'png', 'mp4', 'mp3'], // Add more formats as needed
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0], // Ensure unique filenames
  },
});

const uploadMiddleware = multer({ storage });

export default uploadMiddleware;
