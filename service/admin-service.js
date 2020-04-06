const Admin = require('../model/admin').adminModel
const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')

exports.login = (function(req,res,next){
    const username = req.body.username;
    const password = req.body.password;
    Admin.findOne({email: username},function (err,user) {
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