/**
 * Search Engine
 */
const PostModel = require('../model/post').getModel
const UserModel = require('../model/user').getModel

/** */
module.exports = {
    /**
     * Performs a full text search for post a user
     * @param {string} keyword
     * @param {number} limit
     * @param skip
     * @param {function} onComplete
     */
    search: (keyword,limit,skip,onComplete) => {
        skip = limit*skip;
        console.log(skip)
        PostModel.aggregate([{ $match: { $text: { $search: keyword } }
        },

        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: 'following.userId',
                as: 'following'
            }
        }
        ,
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
                localField: 'user',
                foreignField: '_id',
                as: 'userDetail'
            }
        },
        {
           $lookup: {
               from: 'comments',
               localField: '_id',
               foreignField: 'postId',
               as: 'comments'
            }
       }
       ,{$sort: { 'createdDate': -1 } },{$skip : skip},{ $limit : limit },
        { $project: { "userDetail": {"likes":0,"location":0,"email":0,"age":0,"createdDate":0,"followers":0,"following":0,"totalVoilation":0,"role":0,"password":0}, "audienceFollowers" : 0, "following":0}}


    ]
        ,(err,doc) => {
            if(err){
                console.log(err);
                onComplete(err,null)
            }else{
                onComplete(null,doc)
            }
        }
            )

        },


    searchUser: (keyword,limit,skip,callback) => {
        UserModel.find(
            {$text: {$search: keyword}
            },(err,doc) => {
            if(err){
                callback(err,null)
            }else{
                callback(null,doc)
            }
        }).limit(limit).skip(skip)
    }
}