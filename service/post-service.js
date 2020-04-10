const Post = require('../model/post').getModel;
const searchService = require('../service/search-service')

const fservice = require('../service/filestorage-service');
const wsutil = require('../util/ws-events')
const properties = require('../config/properties')
const Utils = require('../util/apputil')
const comment = require('../model/comment')



const postService = {
    
    create: (function (req, res, next) {
        let post = new Post({
            "user": req.body.user,
            "content": req.body.content,
            "audienceCriteria": {
                age: req.body.ageGroupTarget? JSON.parse(req.body.ageGroupTarget):null
            },
            "audienceLocation": {
                coordinates: req.body.coordinates? JSON.parse(req.body.coordinates):[0,0]
            },
            "audienceFollowers": req.body.targetFollowers? JSON.parse(req.body.targetFollowers): null,
            "notifyFollowers": req.body.notifyFollowers
        });

        

        post.createOrUpdatePost().then((data) => {
          

            if (data.isActive === false) {
                // Account Deactivated
                res.status(403); res.send({ error: true, message: "your account has been deactivated" });
           
            } else if (data.ExceedUNhealthyPost === true) {
                // unhealthy post
                res.send({ error: true, message: "you have exceded number of unhelthy post your account has been deactivated; you will rescive email shortly " });
           
            } else if (req.files != null) {

                let postImages = req.files.imageLink instanceof Array ? req.files.imageLink : [req.files.imageLink]

                try {
                    // upload images
                    post.imageLink = fservice.prepareFiles(postImages).renameAs(post._id.toString()).upload().getNames(); 

                    // send Websocket Notification followers
                    if(post.notifyFollowers){
                        let targetUsers = post.audienceFollowers;
                        publishNotification(targetUsers)
                    }

                    // created
                    res.json({message:"post created"});

                } catch (e) {
                    //
                    console.log(`Error: ${e}`)
                    res.status(500).send('Unable upload pictures')
                }

            } else {

                data.post.then(() => { post.save(); })

                // created
                res.json({message:"post created"});

            }
        }).catch((error) => {   
            console.log(error)

            res.status(406).json({ message:"invalid user Id"});
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
    getAll: (req, res, next) => {
        const page = new Number(req.query.page);
        const limit = new Number(req.query.limit);
        const userId = req.query.user;
        
        Post.find({
            $or: [{user: {$eq: userId}},{"audienceFollowers.user": userId}],
            isHealthy: true
        }).limit(limit).skip(page).sort({ 'createdDate': -1 })
        .exec(function (err, docs) {
                res.send(docs);
        });

    },
    getNearbyPost: (req,res) => {
        const page = new Number(req.query.page);
        const limit = new Number(req.query.limit);
        const userId = req.query.user;
        
        Post.find({
            user: {$not: {$eq: userId}},
            "audienceFollowers.user": {$not: {$eq: userId}},   
            audienceLocation:{
                    $near: {
                        $geometry: {type: "Point",coordinates: cord},
                        $minDistance: properties.geoDistance.minDistance,
                        $maxDistance: properties.geoDistance.maxDistance
                    }
                },
            isHealthy: true
        }).sort({createdDate: -1}).skip(page).limit(limit)
        .exec((err,posts) => {
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
        Post.deleteOne(req.params.postId).then(() => {
            res.send({ error: false, message: "post deleted successfully" });
        }).catch((err) => { throw new Error(err); })
    },
    /**
     * @deprecated
     */
    update: (req, res, next) => {

        Post.findById(req.params.postId).then((post) => {
            let flag = false;
            let imageName = null;
            if (req.files != null) {
                let postImages = req.files.imageLink instanceof Array ? req.files.images : [req.files.images]
                try {


                    let names = fservice.prepareFiles(postImages).renameAs(new String(new Date().getTime())).upload().getNames();

                    if (post.imageLink[0] != null && names[0] != null) {

                        ipath = 'public/uploads/' + post.imageLink[0];
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
    },

    like: (req,res) => {
        let postId = req.params.postId;
        let userId = req.params.userId;
        
        Post.findOne({_id: postId},(err,post) => {
            if (err) {
                res.sendStatus(404)
            } else {
                let isExist = Utils.find(post.likes,(like) => like.toString() === userId.toString())
                if(!isExist)
                    post.likes.push(userId)

                // save to db
                post.save() 

                res.sendStatus(200)
            }
        })
       
    },

    unlike: (req,res) => {
        let postId = req.params.postId;
        let userId = req.params.userId;

        
        PostModel.findOne({_id: postId},(err,post) => {
            if(err){
                res.sendStatus(404)
            } else {     
                let likes = Utils.remove(post.likes,(like) => {
                    return like.toString() === userId
                })
 
                // assign new likes to the object
                post.likes = likes

                post.save()

                res.sendStatus(200)
            }
        })


        
    },

    commentPost: (req,res) => {
        let requestBody = req.body
        let postId = req.params.postId
        let userId = req.params.userId
        let comment = new Comment({content: requestBody.content,postId: postId,user: userId})
        let valid = comment.validateSync()
        if(valid){
            res.status(400).send('Input validation error')
        } else {
            comment.save()

            res.status(202).send()
        }
    },

    deleteComment: (req,res) => {
        let commentId = req.params.commentId;
        commentModel.deleteOne({_id: commentId},(err) => console.log(`${err}`))
        res.sendStatus(200)
    }

}

/**
 * Send Notification to target users
 * @param {User} targetUsers 
 */
function publishNotification(targetUsers){
    if(!targetUsers){ 
        let targetEmails = [];
        for(let user of targetUsers){
            targetEmails.push(user.email)
        }
        wsutil(targetEmails,{reason: properties.appcodes.newPost})
    }
}



module.exports = postService;
