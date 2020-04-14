
const ObjectId = require('mongodb').ObjectId
const User = require('../model/user').getModel;

const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')
const notify = require('../util/ws-events')
const properties = require('../config/properties')

const fservice = require('../service/filestorage-service');
const searchService = require('../service/search-service')
const Post = require('../model/post')
const Postt = require('../model/post').getModel
const mongoose = require('mongoose')
const Utils = require('../util/apputil')
const Ads = require('../model/advertisement').advertisementModel
const BlockedAccount = require('../model/blocked-account')

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
          res.status(200).send(names)
          notify([user.email],{reason: properties.appcodes.profileUpdate})
        })

      })
    }
  } catch (e) {
    res.status(200).send([])
  }
})


// Post to Follow  user 
exports.followUser = async function (req, res) {
  let userId = req.params.userId;
  let followId = req.params.followerId;
  var flag = false;

  let user = await User.findOne({ _id: userId });
  if (!user) {
    res.status(404).send('user not found')
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
      res.status(403).send('Operation denied')
    }

    User.findOne({ _id: followId }, (err, follower) => {
      if (err) {
        res.status(404).send('Unable to follow');
      }

      User.findOne({ _id: userId }, (err, user) => {
        if (err) throw err;
        user.followers.push(new ObjectId(followId));
        user.save();

        //send user a notify about the follow
        notify([user.email], { follower: follower, reason: properties.appcodes.follow })

      });
    });



    res.status(200).send('following  successfully');
  }

}


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

// Post to Follow  user 
exports.followUser = async function (req, res) {
  let userId = req.params.userId;
  let followId = req.params.followerId;
  var flag = false;

  let user = await User.findOne({ _id: userId });
  if (!user) {
    res.status(404).send('user not found')
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
      res.status(403).send('Operation denied')
    }

    User.findOne({ _id: followId }, (err, follower) => {
      if (err) {
        res.status(404).send('Unable to follow');
      }

      User.findOne({ _id: userId }, (err, user) => {
        if (err) throw err;
        user.followers.push(new ObjectId(followId));
        user.save();

        //send user a notify about the follow
        notify([user.email], { follower: follower, reason: properties.appcodes.follow })

      });
    });



    res.status(200).send('following  successfully');
  }

}



// retrieve all follwers of a user
exports.getUserFollower = async function (req, res) {
  User.findOne(ObjectId(req.principal.payload._id)).then((user) => {
    user.populate({path:'followers.userId',select: 'username'})
    .execPopulate().then((data) => { res.send(data.followers) })
    .catch((err) => console.log(err));
  });
}

// Post to Unfollow  user 
exports.unfollowUser = function (req, res) {
  let userId = req.params.userId;
  let followId = req.params.followerId;
  var flag = true;

  User.findOne({ _id: userId }, (err, user) => {
    if (!user) {
      res.status(404).send('User not found')
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

      User.findOne({ _id: followId }, (err) => {
        if (err) {
          res.status(404).send('Unable to follow');
        }

        User.findOne({ _id: userId }, (err, user) => {
          if (err) throw err;
          user.followers.remove(followId);
          user.save();
        });
      });

      //send user a notify about the follow
      notify([user.email], { reason: properties.appcodes.unfollow })

      res.status(200).send('unfollowing  successfully');
    }
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
  console.log("i M in");
  let userId = req.query.userId;
  let limit = parseInt(req.param.limit) >0 ? parseInt(req.param.limit) : 10
  let skip = parseInt(req.param.skip)>0 ? parseInt(req.param.limit) : 0;
  console.log(limit);
  skip=skip*limit;
  Postt.aggregate([{
    $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: 'following.userId',
        as: 'following'
    }
},
 {
    $match: {
         "user": ObjectId( req.principal.payload._id)   
    }
},
 {
    $lookup: {
        from: 'users',
        localField: 'likes.user',
        foreignField: '_id',
        as: 'reactedUsers'
    }
},
{
    $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetail'
    }
},{$sort: { 'createdDate': -1 } },{ $skip : skip },{ $limit : limit },

{ $project: { "userDetail": {"likes":0,"location":0,"email":0,"age":0,"createdDate":0,"followers":0,"following":0,"totalVoilation":0,"role":0,"password":0}, "audienceFollowers" : 0, "following":0}}
]
,function (err,result){
    if(err)
    console.log(err + "  error")
    else{
    console.log(result + "  result" )
    res.send(result);
    }
});

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
  if (key == 'follow') {
    User.findById(userId).then((user) => {
      const exist = user.following.map(function (e) {
        return e.userId;
      }).indexOf(friendId);
      if (exist != -1) {
        res.send({ message: "you have already followd this user" });
      } else {

        user.following.push({ userId: friendId })
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
                  res.json({ message: "started following  user " })
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
            res.json({ message: "started unfollowing user" });
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

exports.loadAds = (req,res) => {

  try{
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.skip);
    let principal = req.principal.payload;

    let query = Ads.find({
      $and: [
        {"audienceCriteria.age.min": {$gte: principal.age}},
        {"audienceCriteria.age.max": {$gte: principal.age}}
      ]
    }).skip(skip).limit(limit)
    query.exec().then((doc) => {
      res.status(200).send(doc)
    })
  }catch (e) {
    res.sendStatus(200)
  }

}

exports.submitAccountForReview = function(req,res) {
  try {
    let email = req.body.email;
    BlockedAccount.findOne({"account.email": email}, (err, doc) => {
      if (err || !doc) {
        res.sendStatus(404)
      }else{
        doc.hasRequestedAReview = true
        doc.save()
        //TODO: Admin Notification
        res.sendStatus(201)
      }
    })
  }catch (e) {
      res.sendStatus(404)
  }

}

