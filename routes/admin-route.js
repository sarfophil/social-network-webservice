var express = require('express');
var router = express.Router();

const blacklistModel = require('../model/blacklistedkeyword');
const postModel = require('../model/post').getModel
const AdvertModel = require('../model/advertisement').advertisementModel
const BlacklistedPostModel = require('../model/blacklistedPost');
const BlockedAccount = require('../model/blocked-account')
const UserModel = require('../model/user').getModel
const nodemailer = require('../util/nodemailer')
const blacklistedPostService = require('../service/blacklistedpost-service');
const adminService = require('../service/admin-service')
const AdminModel = require('../model/admin').adminModel

const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')





/** Admin Login */
router.post('/login',function(req,res) {

    let username = req.body.username
    let password = req.body.password
    AdminModel.findOne({email: username},function(err,user){
        if(err || !user){
            res.sendStatus(403)
        }else {
            let comparePassword = bcrypt.compareSync(password,user.password)
            if(comparePassword){
                jwt.sign(user,(err,token) => {
                    if(err) res.status(500).send('Unable to sign token')
                    res.status(200).send({access_token: token})
                })
            }else{
                res.sendStatus(403)
            }
        }
      })
})


/** Retrieve list of posts */
router.get('/ads',function(req,res) {
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    AdvertModel.find((err,doc) => res.status(200).send(doc)).limit(limit).skip(skip)
})

/**
 * Get an Ad
 */
router.get('/ads/:adId',function (req,res) {
    AdvertModel.findOne({_id: req.params.adId},(err,doc) => {
        res.status(200).send(doc)
    })
})


/**
 * Create Ad
 */
router.post('/ads',adminService.createAd)

/** 
 * Delete ad
 */
router.post('/ads/:id',adminService.deleteAd)

/** Retrieve All Posts */
router.get('/posts', function (req,res) {
    let requestBody = req.body
    postModel.find((err,doc) => res.status(200).send(doc))

    .limit(parseInt(requestBody.limit)).skip(parseInt(requestBody.skip))
})

/** Retrieve list posts by Post Id */
router.get('/posts/:postId',function (req,res) {
    postModel.findById({_id: postId},(err,doc) => res.status(200).send(doc))
})




/**
 * @blacklistPost
 *  Review blacklist posts
 * 
 *  */
router.get('/blacklist/posts/reviews',function (req,res) {
    let page = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    page*=limit;

    BlacklistedPostModel.aggregate([{
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: 'following.userId',
            as: 'following'
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'likes.user',
            foreignField: '_id',
            as: 'reactedUsers'
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'post.user',
            foreignField: '_id',
            as: 'post.userDetail'
        }
    }, { $sort: { 'createdDate': -1 } }, { $skip: page }, { $limit: limit },
    { $project: { "post.userDetail": { "likes": 0, "location": 0, "email": 0, "age": 0, "createdDate": 0, "followers": 0, "following": 0, "role": 0, "password": 0 }, "audienceFollowers": 0, "following": 0 } }

    ]
        , function (err, result) {
            if (err)
                console.log(err + "  error")
            else {
                res.send(result);
            }
        })
})


// accept
router.put('/blacklist/posts/reviews/:reviewId',async function(req,res){
  await  blacklistedPostService.removePostFromBlackListToPost(req.params.reviewId)
    .then(result => {
        res.send({error:false,message:"success"})
    })
    .catch(err => {
        res.send(err)
    })
})


// reject
router.delete('/blacklist/posts/reviews/:reviewId', function(req,res){
    blacklistedPostService.deleteUserPost(req.params.reviewId)
    .then(result => {
        res.status(200).send('')
    })
    .catch(err => {
        res.status(500).send('An Error Occured')
    })
})


/**
 * @blacklist
 * Blacklist
 */
router.post('/blacklistwords',function(req,res) {
    let keywords = req.body;
    
    for(word of keywords){
        let createdWord = new blacklistModel({word: word})
        
        let isExist = createdWord.validateSync()
        if(!isExist) {
            blacklistModel.exists({word: createdWord.word})
            .then(fullfilled => {
                if(!fullfilled){    
                    createdWord.save()
                }
            })
            .catch(reject => {

            })      
        }
    }
    res.status(202).json({'message': 'Accepted'})
})

/**
 * Retrieve Blacklist words
 */
router.get('/blacklistwords',function(req,res) {
    blacklistModel.find((err,doc) => res.status(200).send(doc))
})


/**
 * Remove Blacklisted words
 */
router.delete('/blacklistwords/:blacklistId',function (req,res) {
    blacklistModel.deleteOne({_id: req.params.blacklistId.toString()},(err) => console.log(err))
    res.sendStatus(204)
})


/**
 * @accountReview
 * Account Review By Done
 */
router.get('/accounts/reviews',function(req,res) {
    let limit = parseInt(req.params.limit)
    let skip = parseInt(req.params.skip)
    skip=limit*skip;
    BlockedAccount.find({hasRequestedAReview: true},(err,doc) => res.status(200).send(doc)).skip(skip).limit(limit)
})


/**
 * Approve an Account
 */
router.put('/accounts/reviews/:reviewId', function(req,res) {
    let reviewId = req.params.reviewId;
    BlockedAccount.findById({_id: reviewId},(err,doc) => {
        if(err) res.sendStatus(404)
        
        UserModel.findOne({_id: doc.account._id},(err,user) => {
            if(err) {
                res.sendStatus(404)
            } else {
                //update user info
                user.isActive = true;
                user.totalVoilation = 0
                user.save()

                // remove data from blocked-account collection
                doc.deleteOne()

                // send user an email
                nodemailer.to([user.email])
                        .subject("Account Activated")
                        .text(`Dear ${user.username}, Your Account has been activated successfully`)
                        .sendEmail(onSucess => console.log(`Email Sent ! ${onSucess}`))
                
                res.send({error:false,message:'account has been activated'});
            }

        })

    })
})
/**
 * Reject  Account Activation Request
 */
router.put('/accounts/reviews/:reject', function(req,res) {
    let reviewId = req.params.reviewId;
    BlockedAccount.findByIdAndUpdate({"_id":reviewId},{"hasRequestedAReview": false}, function(err, result){

        if(err){
            res.send(err)
        }
        else{
            res.send({message:"account rejected"});
        }

    })
})



module.exports = router;