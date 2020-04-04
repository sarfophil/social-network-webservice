const User = require('../model/user');


const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')


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

exports.login = (function (req, res)  {
    const username = req.body.username;
    const password = req.body.password;
    UserModel.findOne({$or : [{username: {$eq: username}},{email: {$eq: username}}]},function (err,user) {
      if(err) res.statusCode(403)
      let comparePassword = bcrypt.compareSync(password,user.password) 
      if(comparePassword){
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