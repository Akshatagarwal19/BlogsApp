import mongoose from "mongoose";

const postSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: false
    },

    description: {
        type: String,
        required: true
    },

    mediaPath: {
        type: String,
        required: false
    },

    mediaType: {
        type: String,
        enum: ['video','image','audio','text'],
        required: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
});

const Posts = mongoose.model('Post', postSchema);
export default Posts;