const express = require('express');
const userService=require('../service/user-service');
const router = express.Router();

router.get('/:userId/followers',userService.getUserFollower);
router.post('/:userId/followers/:followerId',userService.followUser);
router.delete('/:userId/followers/:followerId',userService.unfollowUser);

module.exports = router;
