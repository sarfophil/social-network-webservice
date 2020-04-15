
const ObjectId = require('mongodb').ObjectId
const User = require('../model/user').getModel;

const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')
const Utils = require('../util/apputil');
const notify = require('../util/ws-events')
const properties = require('../config/properties')

const fservice = require('../service/filestorage-service');
const searchService = require('../service/search-service')
const Post = require('../model/post')
const mongoose = require('mongoose')
// const Utils = require('../util/apputil')

exports.login = (function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ $or: [{ username: { $eq: username } }, { email: { $eq: username } }] }, function (err, user) {
    if (err) res.statusCode(403)
    let comparePassword = bcrypt.compareSync(password, user.password)
    if (comparePassword) {
      // sign token 
      jwt.sign(user, (err, token) => {
        if (err) {
          res.status(500).send('Unable to sign token')
        } else {
          res.status(200).send({ access_token: token })
        }
      })
    } else {
      res.sendStatus(403)
    }
  })
})

//update profile 
exports.updateProfilePic = (function (req, res) {
  let postImages = req.files.picture instanceof Array ? req.files.picture : [req.files.picture]

  try {
    let names = fservice.prepareFiles(postImages).renameAs(req.params.userId).upload().getNames();
    if (names[0] != null) {
      User.findById(req.params.userId).then((user) => {
        user.profilePicture = names[0];

        user.save().then(() => {
          res.sendStatus(200)
        })

      })
    }
  } catch (e) {
    res.sendStatus(500)
  }
})


// Account creation
exports.signUp = function (req, res) {
  let requestBody = req.body

  // hash password
  requestBody.password = bcrypt.encodeSync(requestBody.password)

  let user = new User(requestBody);

  // validate inputs
  user.validate().then(() => {
    // checks if user is available
    User.exists({ $or: [{ email: { $eq: user.email } }, { username: { $eq: user.username } }] }, (err, isExist) => {
      // if there's any exception
      if (err) {
        res.sendStatus(500)
      } else {

        if (isExist) {
          res.status(403).send('Username/Email already taken another user')
        } else {
          user.save((err) => err ? res.sendStatus(500) : res.json({ message: "User Scuccessfully Created" }))
        }
      }

    })

  }).catch(() => {
    res.status(400).send('Invalid Inputs. Please check your inputs')
  })
}



// retrieve all follwers of a user
exports.getUserFollower = async function (req, res) {
  User.findOne(ObjectId(req.params.userId)).then((user) => {
    user.populate({ path: 'followers.userId', select: ['username', 'followers', 'following'] })
      .execPopulate().then((data) => {
        res.status(200).send(data.followers);
      })
      .catch((err) => {
        new Error(err);
      });
  });
}


exports.login = (function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({ $or: [{ username: { $eq: username } }, { email: { $eq: username } }] }, function (err, user) {
    if (err || !user) {
      res.sendStatus(403)
    } else {
      let comparePassword = bcrypt.compareSync(password, user.password)
      if (comparePassword) {
        jwt.sign(user, (err, token) => {
          if (err) {
            res.status(500).send('Unable to sign token')
          } else {
            res.status(200).send({ access_token: token, user: user })
          }
        })
      } else {
        res.sendStatus(403)
      }
    }

  })
})




exports.searchUser = (req, res) => {
  let searchName = req.params.username;
  let skip = parseInt(req.params.skip);
  let limit = parseInt(req.params.limit)
  searchService.searchUser(searchName, limit, skip, (err, result) => {
    if (result) {
      let searchResult = []
      result.forEach(r => {
        searchResult.push({ _id: r._id, username: r.username })
      })
      res.status(200).send(searchResult)
    }
  })
}

exports.loadUserPosts = (req, res) => {
  let userId = req.query.userId;
  let limit = parseInt(req.param.limit)
  let skip = parseInt(req.param.skip)
  Post.findOne({ user: userId }, (err, doc) => res.send(doc)).limit(limit).skip(skip)
}


// delete Account
exports.deleteAccount = (function (req, res) {
  user.remove({ _id: req.params.userId })
    .exec()
    .then(() => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
})

//follow user
exports.followUser = (req, res, next) => {

  followOrUnfollow(req, res, 'follow');
}

//unfollow user
exports.unfollowUser = (req, res, next) => {

  followOrUnfollow(req, res, 'unfollow');
}

function followOrUnfollow(req, res, key) {
  const userId = ObjectId(req.params.userId);
  const friendId = ObjectId(req.params.friendId);
  let friend ;
  User.findById(req.params.friendId).then((f) => {
    friend=f;
  })
  .catch(err=>{
    console.log(err);
  });
  if (key == 'follow') {
    User.findById(userId).then((user) => {
      const exist = user.following.map(function (e) {
        return e.userId;
      }).indexOf(friendId);
      if (exist != -1) {
        res.send({ message: "you have already followd this user" });
      } else {
        user.following.push({ userId: friendId });
        user.save().then((data) => {
          if (!data) {
            res.send({ message: "unable to follow " })
            return 0;
          } else {
            User.findById(friendId).then((user2) => {
              user2.followers.push({ userId: userId })
              user2.save().then(() => {
                if (!data) {
                  res.send({ message: "unable to follow " })
                } else {
                  res.status(200).send(friend)
                }
              })
            })

          }
        }).catch(err => console.log(err));
      }
    })

  }
  if (key == "unfollow") {

    User.updateOne({ '_id': userId }, { $pull: { following: { userId: friendId } } }, (err, data) => {
      if (err) {
        res.send({ message: "unable to follow  " })

      } else if (data.nModified > 0) {
        User.updateOne({ '_id': friendId }, { $pull: { followers: { 'userId': userId } } }, (err2, data2) => {
          if (err2) {
            res.send({ message: "unable to unfollow 2" })
          } else if (data2.nModified > 0) {
            res.status(200).send(friend)
          } else {
            res.send("you are not following this user 2");
          }
        })
      } else {
        res.send("you are not following this user");
      }
    })

  }
}

exports.getAllUsers = (req, res, next) => {
  User.find({ isActive: true })
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      new Error(err);
    });
}
exports.getUser = (req, res, next) => {
  User.find({ _id: req.params.id })
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      new Error(err);
    });
}


