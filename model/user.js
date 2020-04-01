/**
 * user domain 
 * 
 */
const mongoose = require('mongoose');
//const roleSchema = require('./role');

// user object
const user = {
    username: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        // validates email if correct and has not been taken by any user
        validate:{
            validator: (email) =>{
              return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: props => `${props.value} Validation failed`
        }
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    },
    location:{
        type: Array
    },
    createdDate: {type:Date, default: Date.now},

    totalVoilation: {
        type: Number,
        default: 0
    },
    followers: [{type: mongoose.Schema.Types.ObjectId}],
    profilePicture: String
}

const userSchema = new mongoose.Schema(user);
const userModel = mongoose.model('user',userSchema);

// virtuals
userSchema.virtual('number_of_followers').get(()=> this.followers.length)
userSchema.virtual('addVoilation')
            .set(()=> this.totalVoilation += 1)
            .get(()=> this.totalVoilation)
userSchema.virtual('addFollower')
            .set((follower) => {
                if(this._id != follower._id){    
                    this.followers.push(follower)
                }else{
                    throw new Error('Operation forbidden')
                }
            })


const userDomain  = {
    'getModel': userModel,
    'getSchema': userSchema
}

module.exports = userDomain