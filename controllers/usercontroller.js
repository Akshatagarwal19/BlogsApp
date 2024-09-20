import User from "../models/user.js";
import bcrypt from 'bcryptjs';
import Post from "../models/post.js";
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
            const users = await User.findAll({
                include: [{
                    model: Post,  // Include posts created by each user
                    as: 'posts'   // Make sure the alias matches the one defined in associations.js
                }]
            });
            res.status(200).json({ users });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch users and posts', details: error.message });
        }
    },
    
    getUserById: async (req, res) => {
        const { id } = req.params;

        try {
            const user = await User.findByPk(id); // Fetch user by ID
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
        try {
            const user = await User.findByPk(id);
            if (user) {
                user.username = username || user.username;
                user.email = email || user.email;
                user.role = role || user.role;
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
            res.status(500).json({ error: 'Error updating user', error: error.message });
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