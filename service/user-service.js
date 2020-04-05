const UserModel = require('../model/user').getModel;
const ObjectId=require('mongodb').ObjectId


// Post to Follow  user 
exports.followUser = async function (req, res, next) {
    let userId = req.params.userId;
    let followId = req.params.followerId;
    var flag = false;

    let user = await UserModel.findOne({ _id: userId });
    if (!user) {
        return Promise.reject('User not found');
    }

    for (let f of user.followers) {
        if (f == followId) {
            flag = true;
            break;
        }
    }
    if (flag == true) {
        res.status(200).send('following is not success');
    }
    else {
        if (userId === followId) {
            return Promise.reject('Operation denied');
        }

        UserModel.findOne({ _id: followId }, (err, follower) => {
            if (err) {
                res.status(404).send('Unable to follow');
            }

            UserModel.findOne({ _id: userId }, (err, user) => {
                if (err) throw err;
                user.followers.push(new ObjectId(followId));
                user.save();
            });
        });

        res.status(200).send('following  successfully');
    }

}

// Post to Unfollow  user 
exports.unfollowUser = async function (req, res, next) {
    let userId = req.params.userId;
    let followId = req.params.followerId;
    var flag = true;

    let user = await UserModel.findOne({ _id: userId });
    if (!user) {
        return Promise.reject('User not found');
    }
    for (let f of user.followers) {
        if (f == followId) {
            flag = false;
            break;
        }
    }
    if (flag == true) {
        res.status(200).send('unfollowing is not success');
    }
    else {
        if (userId === followId) {
            return Promise.reject('Operation denied');
        }

        UserModel.findOne({ _id: followId }, (err, follower) => {
            if (err) {
                res.status(404).send('Unable to follow');
            }

            UserModel.findOne({ _id: userId }, (err, user) => {
                if (err) throw err;
                user.followers.remove(followId);
                user.save();
            });
        });

        res.status(200).send('unfollowing  successfully');
    }
}
