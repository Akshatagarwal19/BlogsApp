import User from "../models/user.js";
import fs from "fs";
import path from "path";
import bcrypt from 'bcryptjs';
import Posts from "../models/mongoPosts.js";


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
            const users = await User.findAll();
    
            const usersWithPosts = await Promise.all(users.map(async user => {
                const posts = await Posts.find({ userId: user.id }); 
                return { ...user.toJSON(), posts }; 
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

            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch user', details: error.message });
        }
    },

    updateProfile: async (req, res) => {
        const { username, email, password, role } = req.body;
        const { id } = req.params;
        const profilePhoto = req.file ? req.file.path : null;  
        const isAdmin = req.user.role === 'admin'; 
        const isSelfUpdate = req.user.id === id; 
    
        try {
            
            if (!isAdmin && !isSelfUpdate) {
                return res.status(403).json({ error: 'Access denied: You can only update your own profile or if you are an admin.' });
            }
    
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            user.username = username || user.username;
            user.email = email || user.email;
    
            if (isAdmin && role) {
                user.role = role;
            }
    
            if (profilePhoto) {
                if (user.profilePhoto) {
                    if (fs.existsSync(user.profilePhoto)) { 
                        fs.unlinkSync(user.profilePhoto);  
                    }
                }
                user.profilePhoto = profilePhoto;  
            }
    
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }
    
            await user.save();
            console.log('User updated successfully');
            return res.status(200).json({ message: 'User updated successfully', user });
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
    
            await Posts.deleteMany({ userId: id });
            await user.destroy(); 
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Error deleting user', details: error.message });
        }
    },
};

export default userController;