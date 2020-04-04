<<<<<<< HEAD

module.exports = {

 postAdvertisement: (req, res,err) => {
      if(err){
        return res.status(500).send(err);
}
    res.status(201).json({ad:req.body});
    res.end();
}
};
=======
var express = require('express');
var router = express.Router();
const PostModel = require('../model/post').getModel
const CommentModel = require('../model/comment')
const UserModel = require('../model/user').getModel

// service
const fileStorageService = require('../service/filestorage-service')
const postService = require('../service/post-service')
const searchService = require('../service/search-service')

// util
const Utils = require('../util/appUtil') 




// search post
router.get('/search',function(req,res) {
    let username = req.query.query;
    let limit = parseInt(req.query.limit)
    searchService.search(username,limit,(err,doc) => {
       // console.log(doc)
        res.status(200).send(doc)
    })
})

module.exports = router
>>>>>>> fd28f1e2d6d761abaafaca92d3544fc59eb0fb99
