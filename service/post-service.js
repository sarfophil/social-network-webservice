const Post = require('../model/post').getModel;
const searchService = require('../service/search-service')

const fservice = require('../service/filestorage-service');
const wsutil = require('../util/ws-events')
const properties = require('../config/properties')
const Utils = require('../util/apputil')
const Comment = require('../model/comment')
const userModel = require('../model/user').getModel
const ObjectId = require('mongodb').ObjectId;
const BlacklistedPostModel = require('../model/blacklistedPost');
const ws = require('../config/websocket')


const postService = {



    create: (function (req, res, next) {

        let post = new Post({
            "user": req.principal.payload._id,
            "content": req.body.content,
            "audienceCriteria": {
                age: req.body.ageGroupTarget ? JSON.parse(req.body.ageGroupTarget) : null
            },
            "audienceLocation": {
                coordinates: req.body.coordinates ? JSON.parse(req.body.coordinates) : [0, 0]
            },
            "audienceFollowers": req.body.targetFollowers ? JSON.parse(req.body.targetFollowers) : null,
            "notifyFollowers": req.body.notifyFollowers
        });



        post.createOrUpdatePost().then((data) => {



            if (data.isActive === false) {
                // Account Deactivated
                res.status(403); res.send({ error: true, message: "your account has been deactivated" });

            } else if (data.ExceedUNhealthyPost === true) {
                // unhealthy post
                console.log("unhealthy post");
                res.send({ error: true, message: "you have exceded number of unhelthy post your account has been deactivated; you will rescive email shortly " });

            } else if (req.files != null) {

                let postImages = req.files.imageLink instanceof Array ? req.files.imageLink : [req.files.imageLink]

                try {
                    // upload images
                    let imageLink = fservice.prepareFiles(postImages).renameAs(post._id.toString()).upload().getNames();

                    if (imageLink) {
                        data.post2.imageLink = imageLink;
                        data.post2.save().then((data) => {
                        }).catch((error) => console.log(error));
                    }
                    // send Websocket Notification followers
                    if (post.notifyFollowers) {
                        let targetUsers = post.audienceFollowers;
                        publishNotification(targetUsers)
                    }

                   // wsutil([req.principal.payload.email],{reason: properties.appcodes.postCreated,content: 'Post Created Successfully'})
                    ws().then(socket => {
                        console.log(`Emitted Socket`)
                        socket.emit(req.principal.payload.email,{reason: properties.appcodes.postCreated,content: 'Post Created Successfully'})
                    }).catch(err => console.log(`${err}`))

                    // created
                    res.send({ message: "post created" });

                } catch (e) {
                    //
                    console.log(`Error: ${e}`)
                    res.status(500).send('Unable upload pictures')
                }

            } else {


                if (data.error == false)
                    res.json({ message: "post created" });
                // created

            }
        }).catch((error) => {
            console.log(error)
            res.status(406).json({ message: "invalid user Id" });
        })
    }),
    search: (req, res) => {
        let username = req.query.query;
        let limit = parseInt(req.query.limit);
        let skip = parseInt(req.query.skip)
        searchService.search(username, limit, skip,(err, doc) => {
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
    getAll: (req, res, next) => {
        const id = req.params.userId;
        let page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        page = limit * page;

        Post.aggregate([{
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: 'following.userId',
                as: 'following'
            }
        },
        {
            $match: {
                
                $or: [{ "user": ObjectId(req.principal.payload._id) },{$and:[{ishealthy:true}, { "following": { $elemMatch: { "_id": ObjectId(req.principal.payload._id) } } }]}]
            }
        },
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

        ,{$sort: { 'createdDate': -1 } },{ $skip : page },{ $limit : limit },
        { $project: { "userDetail": {"likes":0,"location":0,"email":0,"age":0,"createdDate":0,"followers":0,"following":0,"totalVoilation":0,"role":0,"password":0}, "audienceFollowers" : 0, "following":0}}

    ]
        ,function (err,result){
            if(err)
            console.log(err + "  error")
            else{
            console.log(result + "  result" )
            res.send(result);
            }
        })

    },
    getNearbyPost: (req, res) => {
        const page = new Number(req.query.page);
        const limit = new Number(req.query.limit);
        const userId = req.query.user;

        Post.find({
            user: { $not: { $eq: userId } },
            "audienceFollowers.user": { $not: { $eq: userId } },
            audienceLocation: {
                $near: {
                    $geometry: { type: "Point", coordinates: cord },
                    $minDistance: properties.geoDistance.minDistance,
                    $maxDistance: properties.geoDistance.maxDistance
                }
            },
            isHealthy: true
        }).sort({ createdDate: -1 }).skip(page).limit(limit)
            .exec((err, posts) => {
                res.send(posts)
            })
    },
    getlikes: (req, res, next) => {
        const id = req.params.postId;
        Post.findById(id).then((data) => {

            data.populate('likes.user').execPopulate().then((data) => { console.log(data); res.send(data.likes) }).catch((err) => console.log(err));
        })
    },
    delete: (req, res, next) => {
        Post.deleteOne({_id:ObjectId(req.params.postId)}).then(() => {
            BlacklistedPostModel.findOneAndDelete({"post._id":ObjectId(req.params.postId)}).then((res)=>{
                res.send({message:"post deleted"})
            }).catch((err)=>{
                res.send({message:"post deleted"})
            })
        }).catch((err) => { throw new Error(err); })
    },




    /**
     * @deprecated
     */
    update: (req, res, next) => {
        console.log(req.body);
        Post.findById(req.params.postId).then((post) => {
            let flag = false;
            let imageName = [];
            if (req.files != null) {
                let postImages = req.files.imageLink instanceof Array ? req.files.imageLink : [req.files.imageLink]
                try {


                    let names = fservice.prepareFiles(postImages).renameAs(new String(new Date().getTime())).upload().getNames();

                    if (post.imageLink != null && names[0] != null) {

                        // ipath = 'public/uploads/' + post.imageLink[0];
                        imageName = names[0];
                        // fileSystem.unlinkSync(path.join(ipath), (err) => {
                        //     if (err) {
                        //         console.log(err);
                        //     }
                        // });
                    }
                    else if (names[0] == null && post.imageLink != null) {
                        imageName = req.body.deleteImage ? null : post.imageLink[0];
                        console.log("image name", imageName);
                    }
                    else if (names[0] != null) {
                        imageName = names[0];
                    }

                } catch (e) {
                    console.log(e);
                }
            }

            post.imageLink = imageName;
            post.content = req.body.content;
            post.updatedDate = Date.now(),
                post.content = req.body.content;
            post.audienceCriteria = req.body.ageGroupTarget ? JSON.parse(req.body.ageGroupTarget) : post.audienceCriteria

            post.audienceLocation = req.body.coordinates ? JSON.parse(req.body.coordinates) : post.audienceLocation

            post.audienceFollowers = req.body.targetFollowers ? JSON.parse(req.body.targetFollowers) : null
            post.notifyFollowers = req.body.notifyFollowers;
            post.likes = post.likes;

            post.createOrUpdatePost().then((data) => {
                console.log(data);
                res.send({ error: false })
            }).catch((err) => { throw new Error(err) });

        })
    },

    like: (req, res) => {
        let postId = req.params.postId;
        let userId = req.params.userId;

        Post.findOne({ _id: postId }, (err, post) => {
            if (err) {
                res.sendStatus(409)
            } else {
                let isExist = Utils.find(post.likes, (like) => like.toString() === userId.toString())
                if (!isExist)
                    post.likes.push(userId)

                // save to db
                post.save().then().catch(err => console.log(err));

                res.sendStatus(204)

                //notification
                userModel.findOne({_id: post.user},(err,user) => {
                    if(req.principal.payload.email != user.email){
                        wsutil([user.email],{reason: properties.appcodes.likePost,content: `${req.principal.payload.username} liked your post`})
                    }

                })
            }
        })

    },

    unlike: (req, res) => {
        let postId = req.params.postId;
        let userId = req.params.userId;


        Post.findOne({_id: postId},(err,post) => {
            if(err){

                res.sendStatus(204)
            } else {     
                let likes = Utils.remove(post.likes,(like) => {
                    return like._id.toString() === userId
                })

                // assign new likes to the object
                post.likes = likes

                post.save()

                res.sendStatus(204)
            }
        })



    },

    commentPost: (req, res) => {
        let requestBody = req.body
        let postId = req.params.postId
        let userId = req.params.userId

        userModel.findOne({ _id: userId }, (err, user) => {
            let comment = new Comment({ content: requestBody.content, postId: postId, user: user })

            let valid = comment.validateSync()
            if (valid) {
                res.status(400).send('Input validation error')
            } else {
                comment.save()

                res.status(202).send()
            }
        })

    },

    getComments: (req, res) => {
        try {
            let skip = parseInt(req.query.skip);
            let limit = parseInt(req.query.limit);
            let postId = req.params.postId;

            Comment.find({ postId: postId }, function (err, comments) {

                res.status(200).send(comments)


            }).limit(limit).skip(skip).sort({ createdDate: -1 })
        } catch (Error) {
            res.status(200).send([])
        }

    },

    countTotalComment: (req, res) => {
        try {
            let postId = req.params.postId;
            Post.findOne({ _id: postId }, (err, post) => {
                post.countComments(postId, (count) => {
                    console.log(`${count}`);
                    res.status(200).send({ comments: count })
                })
            })
        } catch (e) {
            res.status(200).send({ comments: 0 })
        }
    },

    deleteComment: (req, res) => {
        let commentId = req.params.commentId;
        Comment.deleteOne({ _id: commentId }, () => console.log(`${commentId}: Removed`));
        res.sendStatus(204)
    },
//get all unhealthy post
    getUnhealthyPosts:(req,res)=>{
        const id = req.params.userId;
        let page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        page = limit * page;
        console.log("unhealthy");

        BlacklistedPostModel.aggregate([{
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: 'following.userId',
                as: 'following'
            }
        },
        {
            $match: {
             "post.user": ObjectId(id) 
            }
        },
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
                localField: 'post.user',
                foreignField: '_id',
                as: 'post.userDetail'
            }
        }, { $sort: { 'createdDate': -1 } }, { $skip: page }, { $limit: limit },
        { $project: { "post.userDetail": { "likes": 0, "location": 0, "email": 0, "age": 0, "createdDate": 0, "followers": 0, "following": 0, "totalVoilation": 0, "role": 0, "password": 0 }, "audienceFollowers": 0, "following": 0 } }

        ]
            , function (err, result) {
                if (err)
                    console.log(err + "  error")
                else {
                    console.log(result + "  result")
                    res.send(result);
                }
            })

    }

}

/**
 * Send Notification to target users
 * @param {User} targetUsers 
 */
function publishNotification(targetUsers) {
    if (!targetUsers) {
        let targetEmails = [];
        for (let user of targetUsers) {
            targetEmails.push(user.email)
        }
        wsutil(targetEmails, { reason: properties.appcodes.newPost , content: 'A new Post Available'})
    }
}

async function followedBy(user1, user2) {
    const user = await User.findById(user1);
    return user.following.indexOf(a.userId == user2);
}


module.exports = postService;
