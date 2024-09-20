import { error } from 'console';
import Post from '../models/post.js';
import fs from 'fs';
import path from 'path';

const postController = {
    // Create a new post with optional media (video, image, audio, or just text)
    createPost: async (req, res) => {
        const { title, description } = req.body;
        const userId = req.user.id;

        // Handle media if it exists
        const mediaPath = req.file ? req.file.path : null;
        const mediaType = req.file ? req.file.mimetype.split('/')[0] : null; // video, image, audio

        try {
            // Create the post in the database
            const newPost = await Post.create({
                userId,
                title: title || null, // title can be null for text-only posts
                description,
                mediaPath,
                mediaType
            });

            res.status(201).json({ message: 'Post created successfully', post: newPost });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create post', details: error.message });
        }
    },

    // Fetch all posts
    getAllPosts: async (req, res) => {
        try {
            const posts = await Post.findAll();
            res.status(200).json({ posts });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch posts', details: error.message });
        }
    },

    // Fetch a post by ID
    getPostById: async (req, res) => {
        const { id } = req.params;

        try {
            const post = await Post.findByPk(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.status(200).json({ post });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch post', details: error.message });
        }
    },

    // Update post
    updatePost: async (req, res) => {
        const { id } = req.params;
        const { title, description } = req.body;
        const mediaPath = req.file ? req.file.path : null;
        const mediaType = req.file ? req.file.mimetype.split('/')[0] : null;

        try {
            const post = await Post.findByPk(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Update post details
            post.title = title || post.title;
            post.description = description || post.description;

            if (mediaPath) {
                // Optionally update media if a new file is provided
                if (post.mediaPath) {
                    fs.unlinkSync(post.mediaPath); // delete old media file
                }
                post.mediaPath = mediaPath;
                post.mediaType = mediaType;
            }

            await post.save();

            res.status(200).json({ message: 'Post updated successfully', post });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update post', details: error.message });
        }
    },

    // Delete a post
    deletePost: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        try {
            const post = await Post.findByPk(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (post.userId !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'You do not have permission to delete this post' });
            }
            
            // Optionally remove associated media file
            if (post.mediaPath) {
                fs.unlinkSync(post.mediaPath);
            }

            await post.destroy();
            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete post', details: error.message });
        }
    },

    streamPost: async (req ,res) => {
        const { id } = req.params;

        try {
            const post = await Post.findByPk(id);
            if (!post) {
                return res.status(404).json({ error: 'Post Not found' });
            }

            // Handling Image posts
            if (post.mediaType == 'image') {
                const imagePath = post.mediaPath;
                if (!fs.existsSync(imagePath)) {
                    return res.status(404).json({ error: 'Image not found' });
                }

                // serve the image
                res.sendFile(path.resolve(imagePath));
            }
            // Handling Video files 
            else if (post.mediaType === 'video') {
                const videoPath = post.mediaPath;
                const videoStat = fs.statSync(videoPath);
                const fileSize = videoStat.size;
                const range = req.headers.range;

                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                    const chunkSize = (end - start) + 1;
                    const file = fs.createReadStream(videoPath, { start, end });
                    const head = {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accepted-Ranges': `bytes`,
                        'Content-Length': chunkSize,
                        'Content-Type': 'video/mp4', //We can adjust MIME type if needed
                    };

                    res.writeHead(206, head);
                    file.pipe(res);
                } else {
                    const head = {
                        'Content-Length': fileSize,
                        'Content-Type': 'video/mp4', //We can adjust MIME type if needed
                    };
                    res.writeHead(200, head);
                    fs.createReadStream(videoPath).pipe(res);
                }
            }
            else if (post.mediaType === 'audio') {
                const audioPath = post.mediaPath;
                const audioStat = fs.statSync(audioPath);
                const fileSize = audioStat.size;

                const range = req.headers.range;
                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    const chunkSize = (end - start) + 1;
                    const file = fs.createReadStream(audioPath, { start, end });

                    const head = {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunkSize,
                        'Content-Type': 'audio/mpeg',
                    };

                    res.writeHead(206, head);
                    file.pipe(res);
                } else {
                    const head = {
                        'Content-Length': fileSize,
                        'Content-Type': 'audio/mpeg',
                    };

                    res.writeHead(200, head);
                    fs.createReadStream(audioPath).pipe(res);
                }
            }
        }
        catch(error){
            res.status(500).json({ error: 'Failed to stream video', details: error.message });
        }
    },
    // streamAudio: async (req ,res) => {
    //     try {
    //         const { id } = req.params;
    //         const post = await Post.findByPk(id);
    //         if (!post || post.mediaType !== 'audio') {
    //             return res.status(404).json({ error: 'Audio not found or invalid media type' });
    //         }
            
    //         const audioPath = post.mediaPath;
    //         const audioStat = fs.statSync(audioPath);
    //         const fileSize = audioStat.size;
    //         const range = req.headers.range;

    //         if (range) {
    //             const parts = range.replace(/bytes=/, "").split("-");
    //             const start = parseInt(parts[0], 10);
    //             const end = parts[1] ? parseInt(parts[1], 10) : fileSize -1;

    //             const chunkSize = (end - start) + 1;
    //             const file = fs.createReadStream(audioPath, { start, end });
    //             const head = {
    //                 'Content-Range' : `bytes ${start}- ${end}/${fileSize}`,
    //                 'Accepted-Ranges' : 'bytes',
    //                 'Content-Length': chunkSize,
    //                 'Content-Type': 'audio/mp3', // Adjust MIME type if needed 
    //             };

    //             res.writeHead(206, head);
    //             file.pipe(res);
    //         } else {
    //             const head = {
    //                 'Content-Length': fileSize,
    //                 'Content-Type':'audio/mp3', // Adjust MIME type if needed
    //             };
    //             res.writeHead(200, head);
    //             fs.createReadStream(audioPath).pipe(res);
    //         }
    //     }
    //     catch (error) {
    //         res.status(500).json({ error: 'Failed to stream audio', details: error.message });
    //     }
    // },
};

export default postController;