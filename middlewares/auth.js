import e from 'cors';
import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log('Received token:', token);  // Add this to debug
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);  // Add this to check token payload
        req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
        next();
    } catch (error) {
        res.status(500).json({ error: 'Token is invalid', details: error.message });
    }
};

export default authenticate;