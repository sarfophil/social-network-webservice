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


exports.getById = ((req, res, next) => {
    const id = req.params.postId;
    Post.findById(id).then((data) => {
        res.send(data);
    }).catch((err) => { res.send(err) });
})

exports.getAudienceFollowers = ((req, res, next) => {
    const id = req.params.postId;
    Post.findById(id).then((data) => {
        if (data == null) {
            res.send(data);
        }
        else
            data.populate('audienceFollowers.user').execPopulate().then((data) => { res.send(data.audienceFollowers) }).catch((err) => console.log(err));
    })
})

exports.getlikes = ((req, res, next) => {
    const id = req.params.postId;
    Post.findById(id).then((data) => {

        data.populate('likes.user').execPopulate().then((data) => { console.log(data); res.send(data.likes) }).catch((err) => console.log(err));
    })
});

exports.getAll = (async (req, res, next) => {
    const page = new Number(req.query.page);
    const limit = new Number(req.query.limit);
    let posts = await Post.find({})
        .limit(limit).skip(page*limit)
        .sort({'createdDate':1})
        .exec(function (err, docs) {
            if (err) throw new Error(err)
            res.send(docs);
        });

})



module.exports = postService;
