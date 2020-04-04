/**
 * Search Engine
 */
const PostModel = require('../model/post').getModel

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
    }
}