/**
 * Blacklisted Post Services
 * Unhealthy posts will be processed here
 */
const blacklistPostModel = require('../model/blacklistedPost')
const blacklistKeywordModel = require('../model/blacklistedkeyword');
const Post = require('../model/post').getModel
const User = require('../model/user').getModel
const Utils = require('../util/apputil')
const wsutil = require('../util/ws-events')
const properties = require('../config/properties')
const mongoose = require('mongoose');

const blacklistedPostServiceImpl = {
    /**
     * Method stores Unhealthy posts
     * @param {BlacklistPostModel} blacklistPostModel 
     * @param {Callback} callback 
     */
    'blacklistPost': function(postModel,callback){
        let blacklistPost = new blacklistPostModel({post: postModel}) 
        blacklistPost.save().then(()=>{
            callback()
        }).catch(err=>console.error(err));
    },
    /**
     * Loads Blacklist Post
     * @param {Nimber} limit 
     * @param {Function} callback 
     * @param {Number} skip 
     */
    'loadblacklistPost': function(limit,skip,callback){
        blacklistPostModel.find((err,doc)=>{
            if(err) throw new Error("An Error Occured")
            callback(doc);
        })
        .skip(skip)
        .limit(limit)
    },
    /**
     * Scans and validates healthy posts
     * @param {Post} postModel 
     * @param {Function} callback 
     */
    'isHealthy': function(postModel,callback) {
        blacklistKeywordModel.find((err,keywords) => {
            if(err) throw new Error("An error Occured")
            
            let flag = true;
            // Split content into array of strings
            let postContent = postModel.content.split(" ");
            // loop through them
            postContent.forEach(content => {
                let checkWords = Utils.find(keywords,(key) => key.word == content)
                if(checkWords){
                    flag = false
                }
            }) 

            // callback
            callback(flag)
        })
    },

    removePostFromBlackListToPost: async function (reviewId){
        // Search for post

        let blacklistedPost = await blacklistPostModel.find({
            "post._id":mongoose.Types.ObjectId(reviewId)
          }).then((b)=>{
           
          }).catch((err)=>{console.log(err)})

          if(!blacklistedPost)Promise.reject('Post not Available')
        

        // update is helthy status of the post
     await   Post.findById(reviewId).then((post)=>{
            if(post){
            post.isHealthy=true;
            post.save().then(()=>{
                let user = User.findById(post.user).then((user)=>{
                user.totalVoilation = user.totalVoilation - 1;
                user.isActive=true;
                user.save();
                })
                
            });
            }
        })

        // remove from black list
        await blacklistPostModel.deleteOne({
            "post._id":mongoose.Types.ObjectId(reviewId)
          })

        // reduce user voilation

        

        // send notification
        wsutil([user.email],{reason: properties.appcodes.postVerified})

        console.log("i am here");
        // updated
        return Promise.resolve("done");
    },

    deleteUserPost: async function (reviewId) {
        // remove from black list
        await blacklistPostModel.deleteOne({_id: reviewId})
        return Promise.resolve('removed')
    }
}

module.exports = blacklistedPostServiceImpl;