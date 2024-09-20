import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    mediaPath: {
        type: DataTypes.STRING, // Can be null for text-only posts
        allowNull: true
    },
    mediaType: {
        type: DataTypes.ENUM('video', 'image', 'audio', 'text'),
        allowNull: true // If null, it's a text-only post
    },
});

export default Post;
