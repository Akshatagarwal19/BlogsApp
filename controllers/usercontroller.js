import User from "../models/user.js";
import fs from "fs";
import path from "path";
import bcrypt from 'bcryptjs';
import Posts from "../models/mongoPosts.js";

const DEFAULT_IMAGE_PATH = path.resolve('Defaultimg.jpg');

const userController = {
    isAdmin: async (req, res, next) => {
        try {
            const user = await User.findByPk(req.user.id);
            if (user && user.role === 'admin') {
                next();
            } else {
                res.status(403).json({ error: 'Access denied' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error checking admin status', details: error.message });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            // Fetch users from PostgreSQL
            const users = await User.findAll();
    
            // Fetch posts from MongoDB for each user
            const usersWithPosts = await Promise.all(users.map(async user => {
                const posts = await Posts.find({ userId: user.id }); // Adjust this to match how userId is stored in Posts
                return { ...user.toJSON(), posts }; // Combine user data with posts
            }));
    
            res.status(200).json({ users: usersWithPosts });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch users and posts', details: error.message });
        }
    },    
    
    getUserById: async (req, res) => {
        const { id } = req.params;

        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Set a default profile photo if user doesn't have one
            if (!user.profilePhoto) {
                user.profilePhoto = DEFAULT_IMAGE_PATH;  // Adjust to the path where the default image is stored
            }

            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch user', details: error.message });
        }
    },

    updateProfile: async (req, res) => {
        const { username, email, password, role } = req.body;
        const { id } = req.params;
        const profilePhoto = req.file ? req.file.path : null;  // Assumes file upload middleware is used
        try {
            const user = await User.findByPk(id);
            if (user) {
                user.username = username || user.username;
                user.email = email || user.email;
                user.role = role || user.role;
    
                if (profilePhoto) {
                    // If there's a new profile photo, delete the old one if it exists and is not the default
                    if (user.profilePhoto && user.profilePhoto !== path.resolve('Defaultimg.jpg')) {
                        if (fs.existsSync(user.profilePhoto)) { // Check if file exists
                            fs.unlinkSync(user.profilePhoto);  // Remove the old photo file
                        }
                    }
                    user.profilePhoto = profilePhoto;  // Update with new photo path
                }
    
                if (password) {
                    user.password = await bcrypt.hash(password, 10);
                }
    
                await user.save();
                console.log('User updated successfully');
                return res.status(200).json({ message: 'User updated successfully', user });
            } else {
                return res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error updating user', details: error.message });
        }
    },
    

    deleteUser: async (req, res) => {
        const { id } = req.params; 
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            await user.destroy(); // Deleting the user
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Error deleting user', details: error.message });
        }
    },
};

export default userController;