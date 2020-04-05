const express = require('express');
const userService=require('../service/user-service');
const router = express.Router();



router.post('/login', userService.login);

router.post('/follow',userService.followUser);
router.post('/unfollow',userService.unfollowUser);

module.exports = router;
