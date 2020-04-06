const express = require('express');
const userService=require('../service/user-service');
const router = express.Router();

// User Followers Route
//router.get('/:userId/followers',userService.getUserFollower);

// Follow
router.post('/:userId/followers/:followerId',userService.followUser);

// UnFollow
router.delete('/:userId/followers/:followerId',userService.unfollowUser);

// Create Account
router.post('/account',userService.signUp)

// Login
router.post('/login', userService.login);

// Update Profile
router.post(':userId/updateProfile/',userService.updateProfilePic);

// Deactivate Account
router.delete("/:userId", (req, res, next) => {
  user.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console.log(err);
     
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
