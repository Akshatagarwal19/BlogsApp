import Comment from "../models/comments.js";
import Posts from "../models/mongoPosts.js";
import User from "../models/user.js";

const commentController = {
    addComment: async (req, res) => {
        const { postId } = req.params;
        const { commentText } = req.body; 
        try {
            const newComment = new Comment({
                postId,
                commentText,
                userId: req.user.id, 
            });
            await newComment.save();
            res.status(201).json({ message: 'Comment added successfully', comment: newComment });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add comment', details: error.message });
        }
    },

    getCommentsForPost: async (req, res) => {
        const { postId } = req.params;

        try {
            const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

            const formattedComments = await Promise.all(comments.map(async (comment) => {
                const user = await User.findOne({ where: { id: comment.userId } }); 
                return {
                    commentText: comment.commentText,
                    username: user ? user.username : 'Unknown User', 
                    createdAt: comment.createdAt,
                };
            }));

            res.status(200).json({ comments: formattedComments });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
        }
    },

    deleteComment: async (req, res) => {
        const { commentId } = req.params; 
        const userId = req.user.id;

        try {
            const comment = await Comment.findById(commentId); 
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            const user = await User.findByPk(userId); 
            if (!user || (String(comment.userId) !== userId && user.role !== 'admin')) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            await comment.deleteOne();
            res.status(200).json({ message: 'Comment deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting comment', details: error.message });
        }
    },
};

export default commentController;