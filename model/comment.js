/**
 * Comment Domain
 */
const mongoose = require('mongoose')
const user = require('./user');
const userSchema = user.getSchema;

const comment = {
    content: {type: String, required:true},
    createdDate: {type: Date,default:Date.now},
    postId: {type: mongoose.Schema.Types.ObjectId,required:false},
    user: {type: mongoose.Schema.Types.ObjectId},
    likes: {
        type: Number,
        default: 0
    }
}

const commentSchema = new mongoose.Schema(comment);
const commentModel = mongoose.model('comment',commentSchema)


module.exports = commentModel