import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import fs from 'fs';
import path from "path";


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
        type: DataTypes.STRING,  
        allowNull: true,  
    },
}, {
    freezeTableName: true,
});

export default User;