const path = require('path');
const Post = require('../model/post').getModel;
var fileSystem = require('fs');
const mongoose = require('mongoose');
const searchService = require('../service/search-service')
const blacklistService = require('./blacklistedpost-service')
const imageUplader = require('../util/imageUploader');

const fservice = require('../service/filestorage-service');
const uploadPath = require('../public/upload-path').getPath;


const postService = {
    create: (function (req, res, next) {
        const imageName = new String(new Date().getTime());
        let post = new Post({
            "imageLink": imageName,
            "user": mongoose.Types.ObjectId('5e8b0d354c155921222341e6'),
            "content": req.body.content,
            "audienceCriteria": JSON.parse(req.body.audienceCriteria),
            "audienceLocation": JSON.parse(new String(req.body.audienceLocation).trim()),
            "audienceFollowers": JSON.parse(req.body.audienceFollowers),
            "notifyFollowers": req.body.notifyFollowers,
            "likes": null
        });


        post.createOrUpdatePost().then((data) => {

            console.log("createOrUpdatePost", data);

            if (data.isActive === false) {
                res.status(403); res.send({ error: true, message: "your account has been deactivated" });
            }
            else if (data.ExceedUNhealthyPost === true) {
                res.send({ error: true, message: "you have exceded number of unhelthy post your; account has been deactivated; you will rescive email shortly " });
            }

            else if (req.files != null) {
                let postImages = req.files.images instanceof Array ? req.files.images : [req.files.images]

                try {
                    let names = fservice.prepareFiles(postImages).renameAs(new String(imageName)).upload().getNames();
                    res.send({ data: req.body, imageUpload: { eror: true, message: "post created successfully" } });

                } catch (e) {
                    throw new Error(err);
                }

            }
            else {
                post.imageLink = null;
                data.post.then(() => { post.save(); })
                res.send({ eror: false, message: "i" });
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
            if (req.files != null) {
                let postImages = req.files.images instanceof Array ? req.files.images : [req.files.images]
                try {
                    console.log("i path ", post);


                    console.log("image name1", imageName);
                    let names = fservice.prepareFiles(postImages).renameAs(new String(new Date().getTime())).upload().getNames();

                    if (post.imageLink[0] != null && names[0] != null) {

                        ipath = 'public/uploads/' + post.imageLink[0];
                        console.log("ipath ", ipath);
                        console.log("names[0] ", names);

                        imageName = names[0];
                        // fileSystem.unlinkSync(path.join(ipath), (err) => {
                        //     if (err) {
                        //         console.log(err);
                        //     }
                        // });
                    }

                } catch (e) {
                    console.log(e);
                }
            }

            console.log("image name2", imageName)
            post.imageLink = imageName;
            post.content = req.body.content;
            post.updatedDate = Date.now(),
                post.content = req.body.content;
            post.audienceCriteria = JSON.parse(req.body.audienceCriteria);
            post.audienceLocation = JSON.parse(new String(req.body.audienceLocation).trim());
            post.audienceFollowers = JSON.parse(req.body.audienceFollowers);
            post.notifyFollowers = req.body.notifyFollowers;
            post.likes = JSON.parse(req.body.likes);
            post.createOrUpdatePost().then(() => {
                res.send({ error: false })
            }).catch((err) => { throw new Error(err) });

        })
    }

}



module.exports = postService;
