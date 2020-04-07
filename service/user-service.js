
const ObjectId = require('mongodb').ObjectId
const User = require('../model/user').getModel;

const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')
const path = require('path');
const notify = require('../util/ws-events')
const properties = require('../config/properties')

const fservice = require('../service/filestorage-service');
const uploadPath = require('../public/upload-path').getPath;

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
exports.updateProfilePic = (function (req, res, next) {
  console.log(req.files)
  let postImages = req.files.images instanceof Array ? req.files.images : [req.files.images]

  const imageName = new String(new Date().getTime()).trim();
                try {
                    let names = fservice.prepareFiles(postImages).renameAs(imageName).upload().getNames();
                    if(names[0]!=null){
                    User.findById(req.params.userId).then((user)=>{
                      user.profilePicture = imageName;
                      console.log(imageName + " " + names[0])
                      user.save().then(()=>{
                        res.send({ data: req.body, imageUpload: { eror: false, message: "User profile picture updated succesfully" } });
                      })
                    })
                  }
                } catch (e) {
                    throw new Error(e);
                }
})


// Post to Follow  user 
exports.followUser = async function (req, res, next) {
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
        notify([user.email],{follower: follower,reason: properties.appcodes.follow})

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

// Post to Follow  user 
exports.followUser = async function (req, res, next) {
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
        notify([user.email],{follower: follower,reason: properties.appcodes.follow})

      });
    });
    
    

    res.status(200).send('following  successfully');
  }

}



// retrieve all follwers of a user
exports.getUserFollower = async function (req, res, next) {
  const user = await User.findOne({ _id: req.params.userId });
  let results = [];
  for (follower of user.followers) {
    foll = await User.aggregate([{ $match: { _id: follower } }]).project({
      username: 1,
      email: 1,
      age: 1,
      profilePicture: 1
    });

    results.push(foll);
  }


  let flatResult = Utils.flatMap(results,functor=>{
    return functor[0];
  });
  Promise.resolve(flatResult)
    .then(f => {
      res.status(200).send(f);
    })
    .catch(err => new Error(err));
}

// Post to Unfollow  user 
exports.unfollowUser =  function (req, res, next) {
  let userId = req.params.userId;
  let followId = req.params.followerId;
  var flag = true;

  User.findOne({ _id: userId },(err,user) => {
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

        //send user a notify about the follow
        notify([user.email],{reason: properties.appcodes.unfollow})

        res.status(200).send('unfollowing  successfully');
      }
  });


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
    }).catch((err) => {
      throw new Error(err);
    })
  })

 async function validateUser(user) {
    const email = user.email;
    const password = user.password;
    const username = user.username;
    let result = {};
    let err = false;

    
  result.userExist = await User.findOne({ email: email }).then((data) => {

      if (data != null) {
        result.emailExist = true;
        err = true;
      }

    })

   result.usrNameExist =  await User.findOne({ username: username }).then((data) => {
      if (data != null) {
        result.usernameTaken = true;
        err = true;
      }
    })
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false) {
      result.email = { error: true, message: "you have entered invalid Email" }
      err = true;
    }

    if (password.length < 8) {
      result.password = { error: true, message: "password must be 8 or above" }
      err = true;
    }


    result.err = err;
    
  return result;  
  }


  



// delete Account
exports.deleteAccount = (function(req,res,next){
  user.remove({ _id: req.params.userId })
  .exec()
  .then(result => {
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



