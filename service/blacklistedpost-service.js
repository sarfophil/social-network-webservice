/**
 * Blacklisted Post Services
 * Unhealthy posts will be processed here
 */
const blacklistPostModel = require('../model/blacklistedPost')
const blacklistKeywordModel = require('../model/blacklistedkeyword');
const Post = require('../model/post').getModel
const User = require('../model/user').getModel

const Utils = require('../util/apputil')

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
    'loadblacklistPost': function(limit,callback,skip){
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
        let blacklistedPost = await blacklistPostModel.findOne({_id:reviewId})

   
        if(!blacklistedPost) return Promise.reject('Post not Available')

         // reduce voilation by -1
        blacklistedPost.post.isHealthy = true;

        // add to post
        let post = new Post(blacklistedPost.post)
     
        post.save()

        // remove from black list
        await blacklistPostModel.deleteOne({_id: blacklistedPost._id})

        // reduce user voilation
        let user = await User.findOne({_id: blacklistedPost.post.user})
        
        
        user.totalVoilation = user.totalVoilation - 1;

        //
        user.save()

        // updated
        return Promise.resolve(user)
    },

    deleteUserPost: async function (reviewId) {
        // remove from black list
        await blacklistPostModel.deleteOne({_id: reviewId})
        return Promise.resolve('removed')
    }
}

module.exports = blacklistedPostServiceImpl;