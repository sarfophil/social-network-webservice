const express = require('express');
const userService=require('../service/user-service');
const router = express.Router();

// User Followers Route
router.get('/followers',userService.getUserFollower);



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


//unfollow
router.put('/:userId/unfollow/:friendId', userService.unfollowUser);

//follow
router.put('/:userId/follow/:friendId', userService.followUser);

// get Ads
router.get('/:userId/ads',userService.loadAds)


// reporting blocked account for review
router.post('/report',userService.submitAccountForReview)



module.exports = router;
