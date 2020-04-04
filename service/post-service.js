const path = require('path');
const Post = require('../model/post').getModel;
var fileSystem = require('fs');
const mongoose = require('mongoose');
const searchService = require('../service/search-service')
const blacklistService = require('./blacklistedpost-service')



const postService = {
    create : (function (req, res, next) {
        const rootPth = path.dirname(process.mainModule.filename);
        const avatar = req.files.avatar;
        const imagePath = '/images/posts/' + new Date().getTime()+'.jpg';
        console.log(JSON.parse(new String(req.body.audienceLocation).trim()));
        if (avatar.data != null && (avatar.mimetype != "/jpg" || avatar.mimetype != "image/jpeg" || avatar.mimetype != "image/png")) {
            fileSystem.writeFile('public/'+imagePath, req.files.avatar.data, function (err) {
                if (err) throw err;
                else {
                    const post = new Post({
                        "user": mongoose.Types.ObjectId('5e87e715dda9d87aaf676720'),
                        "content": req.body.content,
                        "imageLink": imagePath,
                        "audienceCriteria": JSON.parse(req.body.audienceCriteria),
                        "audienceLocation": JSON.parse(new String(req.body.audienceLocation).trim()),
                        "audienceFollowers": JSON.parse(req.body.audienceFollowers),
                        "notifyFollowers": req.body.notifyFollowers,
                        "likes":null
                    });
    
                    post.createPost().then((data) => {
                        res.send(req.body);
                    }).catch((err) => {
                        throw new Error(err);
                    })
                }
            }
            ); 
        }
    }),
    search : (req,res) => {
        let username = req.query.query;
        let limit = parseInt(req.query.limit)
        searchService.search(username,limit,(err,doc) => {
            res.status(200).send(doc)
        })
    }

}




module.exports = postService;