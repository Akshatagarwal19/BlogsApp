import User from './user.js';
import Post from './post.js';

Post.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'user' });
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'posts' });
