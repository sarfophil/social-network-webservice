const User = require('../model/user');


// Post to Follow  user 
exports.followUser = (function (req, res, next) {
    User.getSchema.virtual('addFollower');
    res.status(201).json({
        message: 'follow user'
    });
});

// Post to Unfollow  user 
exports.unfollowUser = (function (req, res, next) {
    User.getSchema.virtual('addFollower');
    res.status(201).json({
        message: 'unfollow user'
    });
});