var express = require('express');
var router = express.Router();
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
router.get('/search',postService.search)

//Create post
router.post('/create',postService.create);
//Get post by Id
router.get('/:postId',postService.getById);
// Get Audience Followers
router.get('/:postId/audienceFollowers',postService.getAudienceFollowers);
// Get Users who liked the post
router.get('/:postId/likes',postService.getlikes);
// Get All posts
router.get('/',postService.getAll);

module.exports = router;
