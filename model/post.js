/** 
 * Post Domain
 */
const mongoose = require('mongoose');
const User = require('../model/user').getModel
const BlacklistKeywords = require('../model/blacklistedkeyword');
const BlacklistedPost = require('../model/blacklistedPost')
"use strict";
const nodemailer = require("../util/nodemailer");
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
        type: Date
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

postSchema.methods.removeFromCart =async function() {
     return await 1;
}


// Create Index
postSchema.index({ "audienceLocation": "2dsphere" })
postSchema.index({ "audienceFollowers": "followers" })
postSchema.index({ postuname: "text" })

// virtual
postSchema.virtual('totalLikes').get(() => this.likes.length)

//create Post
postSchema.methods.createOrUpdatePost = async function() {
    console.log(this);

   return User.findById(this.user).then((user)=>{
        console.log(user)
        if(user.isActive == false){
        return {"isActive":false};
        
        }
        else {
             return  validatePostContent(this.content).then((isUnhealty) => {

                if (isUnhealty) {
                    this.isHealthy = 'no';
                    ExceedUNhealthyPost(this.user).then((result)=>{
                        if(result)
                      return  {"ExceedUNhealthyPost":true};
                    })
                    console.log("I am here")
                    
                    new BlacklistedPost({
                        "post": this,
                    }).save().then(() => { }).catch(err => { throw new Error(err) });
                    return  {post:this.save(),eror:false};
                }
                else {
                    this.isHealthy = 'yes';
                    return  {post:this.save(),error:false};
                }
            })
        }
    })

     
  
  }


postSchema.statics.getAudienceFollowers = (async function (id) {
  
});


//filtering unhealthy post
function  validatePostContent(content) {
     return result = BlacklistKeywords.find().then((data) => {
        let isUnhealty = false;
        data.findIndex(data => {
            isUnhealty = content.includes(data.word)
            console.log("data",isUnhealty);
            isUnhealty = true
        })
        return isUnhealty;
    });

}
const postModel = mongoose.model('post',postSchema);

/*************Account validation****************
For malicious users (e.g. if the user has more than 20 unhealthy posts)
the account should automatically be deactivated
and notify user by email at the same time.
*/
async function ExceedUNhealthyPost(userId) {
   

    return val =postModel.find({ 'user': userId, 'isHealthy': false }).count().then((number) => {
        User.findById(userId).then((user) => {
            console.log("totalVoilation",number +"  " );
            user.totalVoilation = number;
            if (number >= 9) {
                user.isActive = false;
                nodemailer.subject("Account Deactivation").
                    text("your Account has been deactivated  " + number + " unhealthy posts.")
                    .to(user.email).sendEmail((val) => {
                        console.log(val);
                    });

            }
            user.save();
            return user.totalVoilation >= 9 ? true : false;
        }).catch((err) => {
            throw new Error(err);
        })
    });

}






module.exports = {
    'getSchema': postSchema,
    'getModel': postModel
}