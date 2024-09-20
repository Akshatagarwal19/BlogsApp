import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { where } from 'sequelize';

const authController = {
    login: async (req ,res) => {
        const {email ,password} = req.body;
        try {
            const user = await User.findOne({ where: {email} });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            };

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(404).json({ error: 'Invalid Credentials' });
            };

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });
            res.json({ message: 'Login Successfull', token });
        }
        catch (error) {
            res.status(500).json({ error: 'Login Failed',error: error.message });
        }
    },

    register: async (req ,res) => {
        const {username ,email ,password} = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({ username,email, password: hashedPassword });
            
            const { password: _, ...userWithoutPassword } = newUser.toJSON();
            
            res.json({ message: 'User registered successfully', user: userWithoutPassword });
        }catch(error){
            res.status(500).json({ error: 'Registration Failed',error: error.message });
        }
    },
};

export default authController;
