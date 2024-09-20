import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
// import Video from "./video.js";

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
}, {
    freezeTableName: true,
});

export default User;