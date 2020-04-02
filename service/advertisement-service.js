// const Advertisement = require('../model/advertisement');

const postAdvertisement = (req, res, next) => ({
    title: req.body.title,
    content: req.body.content,
    link: req.body.link,
    banner: req.body.banner,
    createdDate: req.body.createdDate,
    owner: req.body.owner,
    audienceCriteriaMinAge: req.body.audienceCriteria.age.min,
    audienceCriteriaMaxAge: req.body.audienceCriteria.age.max,
    audienceLocationType: req.body.audienceLocation.type,
    audienceCoordinates: req.body.audienceLocation.coordinates,
    advertisementLikes: req.body.likes,
    commentsUsername: req.body.comments.username,
    commentsEmail: req.body.comments.email,
    commentsMessage: req.body.comments.message,
    commentsLikes: req.body.comments.likes
}).then(()=>{
    res.status(201).json({
        message:'Ad Saved Successfully'
    }).catch((error)=>{
        res.status(400).json({
            error:error
        });
    });
});

module.exports = postAdvertisement;