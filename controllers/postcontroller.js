import Posts from '../models/mongoPosts.js';
import fs from 'fs';
import cloudinary from 'cloudinary';

const postController = {

    createPost: async (req, res) => {
        const { title, description } = req.body;
        const userId = req.user.id;

        const mediaUrl = req.file ? req.file.path : null;  // Cloudinary URL
        const mediaType = req.file ? req.file.mimetype.split('/')[0] : null;  // e.g., 'image', 'video'

        try {
            const newPost = await Posts.create({
                userId,
                title: title || null,
                description,
                mediaPath: mediaUrl,  // Store the Cloudinary URL
                mediaType,
            });

            res.status(201).json({ message: 'Post created successfully', post: newPost });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create post', details: error.message });
        }
    },

    getAllPosts: async (req, res) => {
        try {
            const posts = await Posts.find().sort({ createdAt: -1 });
            res.status(200).json({ posts });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch posts', details: error.message });
        }
    },

    getPostById: async (req, res) => {
        const { id } = req.params;

        try {
            const post = await Posts.findById(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.status(200).json({ post });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch post', details: error.message });
        }
    },

    updatePost: async (req, res) => {
        const { id } = req.params;
        const { title, description } = req.body;
        const mediaUrl = req.file ? req.file.path : null; // Cloudinary URL
        const mediaType = req.file ? req.file.mimetype.split('/')[0] : null;

        try {
            const post = await Posts.findById(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            post.title = title || post.title;
            post.description = description || post.description;

            if (mediaUrl) {
                // Delete the old media from Cloudinary if new media is uploaded
                const oldPublicId = post.mediaPath.split('/').pop().split('.')[0];
                await cloudinary.v2.uploader.destroy(oldPublicId);

                post.mediaPath = mediaUrl;  // Update to new Cloudinary URL
                post.mediaType = mediaType;
            }

            await post.save();

            res.status(200).json({ message: 'Post updated successfully', post });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update post', details: error.message });
        }
    },

    deletePost: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        try {
            const post = await Posts.findById(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (post.userId.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'You do not have permission to delete this post' });
            }

            // Delete the media from Cloudinary if it exists
            if (post.mediaPath) {
                const publicId = post.mediaPath.split('/').pop().split('.')[0];
                await cloudinary.v2.uploader.destroy(publicId);
            }

            await post.deleteOne();
            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete post', details: error.message });
        }
    },

    streamPost: async (req, res) => {
        const { id } = req.params;
    
        try {
            const post = await Posts.findById(id);  // Fetch post from DB
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
    
            // Redirect to the Cloudinary URL based on the mediaType (video/audio)
            if (post.mediaType === 'video' || post.mediaType === 'audio') {
                const mediaUrl = post.mediaPath; // This is the Cloudinary URL
                res.redirect(mediaUrl); // Redirect to the Cloudinary URL
            } else {
                res.status(400).json({ error: 'Unsupported media type' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to stream media', details: error.message });
        }
    }
    
};

export default postController;
