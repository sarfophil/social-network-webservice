/**
 * Object will contain blacklisted words from admin
 * which will be compared to user posts for violations
 */
const mongoose = require('mongoose');

const blacklist = {
    word: {type: String,required: true}
}

const blacklistSchema = new mongoose.Schema(blacklist);
const blacklistModel = mongoose.model('blacklists',blacklistSchema);

module.exports = blacklistModel