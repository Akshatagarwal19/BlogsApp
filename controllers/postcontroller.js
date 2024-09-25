import fs from 'fs';
import path from 'path';
import Posts from '../models/mongoPosts.js';  

const postController = {
    
    createPost: async (req, res) => {
        const { title, description } = req.body;
        const userId = req.user.id;

        const mediaPath = req.file ? req.file.path : null;
        const mediaType = req.file ? req.file.mimetype.split('/')[0] : null; 

        try {
            const newPost = await Posts.create({
                userId,
                title: title || null, 
                description,
                mediaPath,
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
        const mediaPath = req.file ? req.file.path : null;
        const mediaType = req.file ? req.file.mimetype.split('/')[0] : null;

        try {
            const post = await Posts.findById(id);  
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            post.title = title || post.title;
            post.description = description || post.description;

            if (mediaPath) {
                
                if (post.mediaPath) {
                    fs.unlinkSync(post.mediaPath); 
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

            if (post.mediaPath) {
                fs.unlinkSync(post.mediaPath);
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
            const post = await Posts.findById(id);  
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (post.mediaType === 'image') {
                const imagePath = post.mediaPath;
                if (!fs.existsSync(imagePath)) {
                    return res.status(404).json({ error: 'Image not found' });
                }
                res.sendFile(path.resolve(imagePath));
            } 
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
                        'Content-Type': 'video/mp4', 
                    };

                    res.writeHead(206, head);
                    file.pipe(res);
                } else {
                    const head = {
                        'Content-Length': fileSize,
                        'Content-Type': 'video/mp4', 
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
        catch (error) {
            res.status(500).json({ error: 'Failed to stream media', details: error.message });
        }
    },
};

export default postController;
