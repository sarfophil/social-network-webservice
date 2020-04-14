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
     * @param {function} onComplete
     */
    search: (keyword,limit,onComplete) => {
        PostModel.find({$text: {$search: keyword}},(err,doc) => {
            if(err){
                onComplete(err,null)
            }else{
                onComplete(null,doc)
            }
        }).limit(limit)
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