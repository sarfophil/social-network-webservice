const express = require('express');
const userService=require('../service/user-service');
const router = express.Router();

// User Followers Route
router.get('/:userId/followers',userService.getUserFollower);

// Follow
router.post('/:userId/followers/:followerId',userService.followUser);

// UnFollow
router.delete('/:userId/followers/:followerId',userService.unfollowUser);

// Create Account
router.post('/account',userService.signUp)

// Login
router.post('/login', userService.login);

// Update Profile
router.put('/account/profilepic/:userId',userService.updateProfilePic); 

// user service
router.get('/search',userService.searchUser)


// Deactivate Account
router.delete("/:userId", userService.deleteAccount);


// user posts
router.get('/:userId/posts',userService.loadUserPosts)

module.exports = router;
