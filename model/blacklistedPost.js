/**
 * UnHealthy Posts Model
 */
const mongoose = require('mongoose');
const Post = require("./post")
const blacklistedPost = {
    post: {
        type: Post,
        required: true
    },
    reportedDate:{
        type: Date,
        default: Date.now
    }
}

const blacklistedPostSchema = new mongoose.Schema(blacklistedPost);
module.exports = mongoose.model('unhealthypost',blacklistedPostSchema)