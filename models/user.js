import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import fs from 'fs';
import path from "path";

const DEFAULT_IMAGE_PATH = path.resolve('Defaultimg.jpg');

const User = sequelize.define('Users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username : {
        type: DataTypes.STRING,
        alllowNull: false,
        unique: true,
    },
    email : {
        type: DataTypes.STRING,
        alllowNull: false,
        unique: true,
    },
    password : {
        type: DataTypes.STRING,
        alllowNull: false,
    },
    role: { 
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
    },
    profilePhoto: {
        type: DataTypes.STRING,  // Store file path of the profile photo
        allowNull: true,  // Optional field
        defaultValue: DEFAULT_IMAGE_PATH,  // Default image path or URL
    },
}, {
    freezeTableName: true,
});

if (!fs.existsSync(DEFAULT_IMAGE_PATH)) {
    console.error(`Default image not found at path: ${DEFAULT_IMAGE_PATH}`);
}


export default User;