var express = require('express');
var router = express.Router();
const postService = require('../service/post-service')




// search post
router.get('/search',postService.search)

router.post('/create',postService.create);


module.exports = router;
