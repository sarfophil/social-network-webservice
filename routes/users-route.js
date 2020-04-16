const express = require('express');
const userService=require('../service/user-service');
const router = express.Router();

// User Followers Route
router.get('/followers',userService.getUserFollower);

// User Followings
router.get('/following',userService.getUserFollowings)


// Create Account
router.post('/account',userService.signUp)

// Login
router.post('/login', userService.login);

// Update Profile
router.put('/account/profilepic/:userId',userService.updateProfilePic); 

// user service
router.get('/search',userService.searchUser)

// get a user
router.get('/find/:userId',userService.findUserById)

// Deactivate Account
router.delete("/:userId", userService.deleteAccount);


// user posts
router.get('/:userId/posts',userService.loadUserPosts)


//unfollow
router.put('/:userId/unfollow/:friendId', userService.unfollowUser);

//follow
router.put('/:userId/follow/:friendId', userService.followUser);

// get Ads
router.get('/:userId/ads',userService.loadAds)


// reporting blocked account for review
router.post('/report',userService.submitAccountForReview)


// notification
router.get('/notification',userService.getNotification)


// check notification
router.get('/check_notification',userService.checkNotification)


module.exports = router;
