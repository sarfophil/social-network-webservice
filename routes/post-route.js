var express = require('express');
var router = express.Router();
const postService = require('../service/post-service')




// search post
router.get('/search',postService.search)

//Create post
router.post('/',postService.create);
//Get post by Id
router.get('/:postId',postService.getById);
// Get Audience Followers
router.get('/:postId/audienceFollowers',postService.getAudienceFollowers);
// Get Users who liked the post
router.get('/:postId/likes',postService.getlikes);
// Get All posts
router.get('/',postService.getAll);
//deletePost
router.delete('/:postId',postService.delete)
//updatePost
router.put('/:postId',postService.update)


module.exports = router;
