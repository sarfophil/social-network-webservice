/** 
 * Post Domain
 */
"use strict";
const mongoose = require('mongoose');
const User = require('../model/user').getModel
const BlacklistKeywords = require('../model/blacklistedkeyword');
const BlacklistedPost = require('../model/blacklistedPost')
const nodemailer = require("../util/nodemailer");
const Schema = mongoose.Schema;
const wsutil = require("../util/ws-events")
const properties = require("../config/properties")

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



// Create Index
postSchema.index({ "audienceLocation": "2dsphere" })
postSchema.index({ "audienceFollowers": "followers" })
postSchema.index({ postuname: "text" })

// virtual
postSchema.virtual('totalLikes').get(() => this.likes.length)

//create Post
postSchema.methods.createOrUpdatePost = async function() {
   return User.findById(this.user).then((user)=>{

        this.postuname = user.username

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
                    
                    const blacklistPost =  new BlacklistedPost({post: this})
                    blacklistPost.save()

                    return  {post:null,eror:false};
                } else {
                    this.isHealthy = 'yes';
                    return  {post:this.save(),error:false};
                }
            })
        }
    })

     
  
  }


//filtering unhealthy post
function  validatePostContent(content) {
     return BlacklistKeywords.find().then((data) => {
        let isUnhealty = false;
        data.findIndex(data => {
            let test = content.includes(data.word)
            if(test) isUnhealty = true
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
    return postModel.find({ 'user': userId, 'isHealthy': false }).countDocuments().then((number) => {
        User.findById(userId).then((user) => {
            
            user.totalVoilation = number;

            if (number >= 20) {
                user.isActive = false;

                nodemailer
                    .subject("Account Deactivation")
                    .text("your Account has been deactivated  " + number + " unhealthy posts.")
                    .to([user.email])
                    .sendEmail((result) => console.log(`Email Sent: ${result}`))
                
                // websocket notification
                wsutil([user.email],{reason: properties.appcodes.accountBlocked})
            }


            user.save();

            wsutil([user.email],{reason: properties.appcodes.unhealthyPost})

            return user.totalVoilation >= 20 ? true : false;
        }).catch((err) => {
            throw new Error(err);
        })
    });

}






module.exports = {
    'getSchema': postSchema,
    'getModel': postModel
}