const path = require('path');
const Post = require('../model/post').getModel;
var fileSystem = require('fs');
const mongoose = require('mongoose');
const searchService = require('../service/search-service')
const blacklistService = require('./blacklistedpost-service')
const imageUplader = require('../util/imageUploader');



const postService = {
    create: (function (req, res, next) {

        const rootPth = path.dirname(process.mainModule.filename);
        const imagePath = '/images/posts/' + new Date().getTime() + '.jpg'


        let post = new Post({
            "user": mongoose.Types.ObjectId('5e87e715dda9d87aaf676720'),
            "content": req.body.content,
            "imageLink": imagePath,
            "audienceCriteria": JSON.parse(req.body.audienceCriteria),
            "audienceLocation": JSON.parse(new String(req.body.audienceLocation).trim()),
            "audienceFollowers": JSON.parse(req.body.audienceFollowers),
            "notifyFollowers": req.body.notifyFollowers,
            "likes": null
        });

        
        post.removeFromCart().then((d)=>console.log(d));
        post.createOrUpdatePost().then((data) => {
            console.log("i minside");
            if ( req.files!= null) {
                imageUplader.upload(req, imagePath).then((cb) => {
                    if (cb == 1) {
                        res.send(req.body);
                    }
                    else {
                        data.imageLink = null;
                        data.save();
                        res.send({ post: req.body, imageUpload: { eror: true, message: "unabele to upload file" } });
                    }
                }).catch((err) => {
                    throw new Error(err);
                })
            }
            else {
                data.imageLink = null;
                data.save();
                res.send({ post: req.body, imageUpload: { eror: false, message: "image not provided!" } });
            }
        }).catch((err) => {
            throw new Error(err);
        })
    }),
    search: (req, res) => {
        let username = req.query.query;
        let limit = parseInt(req.query.limit)
        searchService.search(username, limit, (err, doc) => {
            res.status(200).send(doc)
        })
    },
    getById: (req, res, next) => {
        const id = req.params.postId;
        Post.findById(id).then((data) => {
            res.send(data);
        }).catch((err) => { res.send(err) });
    },
    getAudienceFollowers: (req, res, next) => {
        const id = req.params.postId;
        Post.findById(id).then((data) => {
            if (data == null) {
                res.send(data);
            }
            else
                data.populate('audienceFollowers.user').execPopulate().then((data) => { res.send(data.audienceFollowers) }).catch((err) => console.log(err));
        })
    },
    getAll: async (req, res, next) => {
        const page = new Number(req.query.page);
        const limit = new Number(req.query.limit);
        let posts = await Post.find({})
            .limit(limit).skip(page * limit)
            .sort({ 'createdDate': 1 })
            .exec(function (err, docs) {
                if (err) throw new Error(err)
                res.send(docs);
            });

    },
    getlikes: (req, res, next) => {
        const id = req.params.postId;
        Post.findById(id).then((data) => {

            data.populate('likes.user').execPopulate().then((data) => { console.log(data); res.send(data.likes) }).catch((err) => console.log(err));
        })
    },
    delete: (req, res, next) => {
        Post.deleteOne(req.params.postId).then(() => {
            res.send({ error: false, message: "post deleted successfully" });
        }).catch((err) => { throw new Error(err); })
    },
    update: (req, res, next) => {
         
        Post.findById(req.params.postId).then((post) => {
            let flag = false;
            let imageName = null;
            if (req.files!= null) {
                file = req.files.avatar;
                imageName = new Date().getTime()+'.jpg';
                imagePath = '/images/posts/' + imageName;

                imageUplader.upload(imagePath, file.mimetype, file.data, function (result) {
                    console.log("IM age Link",post.imageLink)

                    if (result == 1) {

                        if(post.imageLink[0]!=null){
                            fileSystem.unlinkSync("public/images/posts/"+post.imageLink[0],(err)=>{
                                if(err){
                                    console.log(err);
                                }

                            });
                        }
                    }
                    else{
                        imageName = null;
                    }
                });
            }
                    post.imageLink= imageName;
                    post.content=req.body.content;
                    post.updatedDate= Date.now(),
                    post.content= req.body.content;
                    post.audienceCriteria= JSON.parse(req.body.audienceCriteria);
                    post.audienceLocation= JSON.parse(new String(req.body.audienceLocation).trim());
                    post.audienceFollowers= JSON.parse(req.body.audienceFollowers);
                    post.notifyFollowers= req.body.notifyFollowers;
                    post.likes= JSON.parse(req.body.likes);
                    post.createOrUpdatePost().then(()=>{
                        res.send({error:false})
                    }).catch((err)=>{throw new Error(err)});

               
            
        })
    }

}



module.exports = postService;
