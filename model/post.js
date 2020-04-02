/** 
 * Post Domain
 */
const mongoose = require('mongoose');

const post = {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageLink: [{type:String}],
    createdDate:{
        type: Date,
        default: Date.now
    },
    likes: [{type: mongoose.Schema.Types.ObjectId,required: false}],
    isHealthy: {
        type: Boolean,
        default: true
    },
    audienceCriteria:{
        age: {min:Number,max:Number}
    },
    audienceLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: [{type:Number}]
    },
    audienceFollowers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId
            }
        }
    ],
    notifyFollowers: {
        type: Boolean,
        default: true
    },
    postuname: String   // Field used for Full text search
};


const postSchema = new mongoose.Schema(post);

// Create Index
postSchema.index({"audienceLocation":"2dsphere"})
postSchema.index({"audienceFollowers":"followers"})
postSchema.index({postuname:"text"})

// virtual
postSchema.virtual('totalLikes').get(()=>this.likes.length)

// Post Model
const postModel = mongoose.model('post',postSchema);



module.exports = {
    'getSchema': postSchema,
    'getModel': postModel
}