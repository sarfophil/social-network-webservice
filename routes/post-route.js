var express = require('express');
var router = express.Router();
const PostModel = require('../model/post').getModel
const CommentModel = require('../model/comment')
const UserModel = require('../model/user').getModel

// service
const fileStorageService = require('../service/filestorage-service')
const postService = require('../service/post-service')
const searchService = require('../service/search-service')

const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')


router.post('/login', (req, res) => {
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
  });

// search post
router.get('/search',function(req,res) {
    let username = req.query.query;
    let limit = parseInt(req.query.limit)
    searchService.search(username,limit,(err,doc) => {
       // console.log(doc)
        res.status(200).send(doc)
    })
})

router.post('/create',postService.create);


module.exports = router;
