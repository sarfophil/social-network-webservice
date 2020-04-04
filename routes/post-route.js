var express = require('express');
var router = express.Router();
const PostModel = require('../model/post').getModel
const CommentModel = require('../model/comment')
const UserModel = require('../model/user').getModel

// service
const fileStorageService = require('../service/filestorage-service')
const postService = require('../service/post-service')
const searchService = require('../service/search-service')

// util
// const Utils = require('../util/appUtil') 




// search post
router.get('/search',function(req,res) {
    let username = req.query.query;
    let limit = parseInt(req.query.limit)
    searchService.search(username,limit,(err,doc) => {
       // console.log(doc)
        res.status(200).send(doc)
    })
})

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
