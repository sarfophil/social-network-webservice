/** 
 * Post Domain
 */
const mongoose = require('mongoose');
const User = require('../model/user').getModel
const blacklistKeywords = require('../model/blacklistedkeyword');
const BlacklistedPost = require('../model/blacklistedPost')

const Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    content: {
        type: String,
    },
    imageLink: [{ type: String }],
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: null
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User
        }
    }],
    isHealthy: Boolean,
    audienceCriteria: {
        age: { min: Number, max: Number }
    },
    audienceLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: [{ type: Number }]
    },
    audienceFollowers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: User
            }
        }
    ],
    notifyFollowers: {
        type: Boolean,
        default: true
    },
    postuname: String   // Field used for Full text search
});




// Create Index
postSchema.index({ "audienceLocation": "2dsphere" })
postSchema.index({ "audienceFollowers": "followers" })
postSchema.index({ postuname: "text" })

// virtual
postSchema.virtual('totalLikes').get(() => this.likes.length)

//create Post
postSchema.methods.createPost = async function createPost() {
    validatePostContent(this.content).then((isUnhealty) => {
        // console.log(isUnhealty);
        if (isUnhealty) {
            this.isHealthy = 'no';
            new BlacklistedPost({
                "post": this,
            }).save().then(() => { }).catch(err => { throw new Error(err) });
            return this.save()
        }
        else {
            this.isHealthy = 'yes';
            return this.save();
        }
    })

}

postSchema.statics.getAudienceFollowers = (async function (id) {

});


//filtering unhealthy post
function validatePostContent(content) {
    return result = blacklistKeywords.find().then((data) => {
        var isUnhealty = false;

        data.findIndex(data => {
            isUnhealty = content.includes(data.word)
            if (isUnhealty) return true;
        })
        return isUnhealty;
    }).catch((err) => console.log(err))

}

// Post Model
exports.getModel = mongoose.model('post', postSchema);

