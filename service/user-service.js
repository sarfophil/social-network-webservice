
const ObjectId = require('mongodb').ObjectId
const User = require('../model/user').getModel;

const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')
const path = require('path');
const imageUplader = require('../util/imageUploader');


exports.login = (function(req,res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({$or : [{username: {$eq: username}},{email: {$eq: username}}]},function (err,user) {
      if(err) res.statusCode(403)
      let comparePassword = bcrypt.compareSync(password,user.password) 
      if(comparePassword){
        // sign token 
        jwt.sign(user,(err,token) => {
          if(err) {
              res.status(500).send('Unable to sign token')
          }else{ 
            res.status(200).send({access_token: token})
          }
        })
      }else{
        res.sendStatus(403)
      }
    })
})

//update profile 
exports.updateProfile = (function (req, res, next) {
  const userId = req.params.userId;
  const image = req.files.image
  const mimetype = req.files.mimetype;
  const imagePath = path.join('/images/posts/' + new Date().getTime() + '.jpg');
 
  if (image != null && (mimetype != 'image/jpeg' || mimetype != 'image/jpg' || mimetype != 'image/png')) {
    User.findOne(userId).then((user) => {
      if (user != null) {
        const oldPrfilePath = user.profilePicture

        FileSystem.createWriteStream(path.join('public' + imagePath), image).then(() => {
          user.profilePicture = imagePath;
          FileSystem.unlinkSync(path.join('public/' + oldPrfilePath));
          user.save().then(() => {
            res.send({ error: false, message: "Profile Updated successfully!" })
          })
        }).catch((err) => {
          throw new Error(err);
        })
      }
    }).catch((err) => {
      throw new Error(err);
    })
  }
  else res.send({ error: true, message: 'invalid file' });

})

// Post to Follow  user 
exports.followUser = async function (req, res, next) {
  let userId = req.params.userId;
  let followId = req.params.followerId;
  var flag = false;

  let user = await User.findOne({ _id: userId });
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

    User.findOne({ _id: followId }, (err, follower) => {
      if (err) {
        res.status(404).send('Unable to follow');
      }

      User.findOne({ _id: userId }, (err, user) => {
        if (err) throw err;
        user.followers.push(new ObjectId(followId));
        user.save();
      });
    });

    res.status(200).send('following  successfully');
  }

}

// Account creation
exports.signUp = function(req,res) {
  let requestBody = req.body
 
  // hash password
  requestBody.password = bcrypt.encodeSync(requestBody.password)

  let user = new User(requestBody);

  // validate inputs
  user.validate().then((response)=>{
    // checks if user is available
    User.exists({ $or: [{email: {$eq: user.email}},{username: {$eq: user.username}}] },(err,isExist) => {
      // if there's any exception
      if(err){
        res.sendStatus(500)
      }else{
         
          if(isExist){
            res.status(200).send('Username/Email already taken another user')
          }else{ 
            user.save((err,doc) => err? res.sendStatus(500): res.sendStatus(201))
          }
      }
      
    })
     
    }).catch(err => {
      res.status(400).send('Invalid Inputs. Please check your inputs')
    })
}


// Post to Unfollow  user 
exports.unfollowUser = async function (req, res, next) {
  let userId = req.params.userId;
  let followId = req.params.followerId;
  var flag = true;

  let user = await User.findOne({ _id: userId });
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

    User.findOne({ _id: followId }, (err, follower) => {
      if (err) {
        res.status(404).send('Unable to follow');
      }

      User.findOne({ _id: userId }, (err, user) => {
        if (err) throw err;
        user.followers.remove(followId);
        user.save();
      });
    });

    res.status(200).send('unfollowing  successfully');
  }


exports.login = (function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ $or: [{ username: { $eq: username } }, { email: { $eq: username } }] }, function (err, user) {
      if (err) res.statusCode(403)
      let comparePassword = bcrypt.compareSync(password, user.password)
      if (comparePassword) {
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

  async function validitUser(user) {
    const email = user.email;
    const password = user.password;
    const username = user.username;
    const result = {};
    let err = false;

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false) {
      result.email = { error: true, message: "you have entered invalid Email" }
      err = true;
    }
    User.findOne({ email: email }).then((data) => {
      if (data != null) {
        result.email.exist = true;
        err = true;
      }
    }).catch(() => { });
    User.findOne({ username: username }).then((data) => {
      if (data != null) {
        result.username = { message: "username taken" };
        err = true;
      }
    }).catch(() => { });

    if (password.length < 8) {
      result.password = { error: true, message: "password must be 8 or above" }
      err = true;
    }

    result.err = err;
    console.log("validate User");
    return await result;
  }
  async function saveImage(req, imagePath) {

    console.log(req.files);
    if (req.files != null && req.files.avatar != null) {
      const avatar = req.files.avatar;
      imageUplader.upload(imagePath, avatar.mimetype, avatar.data, (cb) => {
        console.log(avatar);
        if (cb == -1) {
          return -1;
        }
        else if (cb == 1) {
          return 1;
        }

      })
    }

    return 0;
  }
}


// delete Account
exports.deleteAccount = (req, res, next) => {
  user.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console.log(err);
     
      res.status(500).json({
        error: err
      });
    });
}
