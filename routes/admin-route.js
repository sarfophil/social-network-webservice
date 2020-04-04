var express = require('express');
var router = express.Router();
const blacklistModel = require('../model/blacklistedkeyword')











/**
 * @blacklistPost
 *  Review blacklist posts
 * 
 *  */
router.get('/blacklist/posts/reviews',function (req,res) {
    BlacklistedPostModel.find((err,doc) => res.status(200).send(doc))
    .limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip))
})
// accept
router.put('/blacklist/posts/reviews/:reviewId',function(req,res){
    blacklistedPostService.removePostFromBlackListToPost(req.params.reviewId)
    .then(result => {
        res.status(200).send('Post Added')
    })
    .catch(err => {
        res.status(500).send('An Error Occured')
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
    res.status(201).send('blacklist created')
})

router.get('/blacklistwords',function(req,res) {
    blacklistModel.find((err,doc) => res.status(200).send(doc))
})

router.delete('/blacklistwords/:blacklistId',function (req,res) {
    blacklistModel.deleteOne({_id: req.params.blacklistId.toString()},(err) => console.log(err))
    res.status(200).send('keyword removed')
})


module.exports = router;