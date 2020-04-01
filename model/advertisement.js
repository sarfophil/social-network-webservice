/**
 * Advertisement Model
 */
const mongoose = require('mongoose')

const advertisement = {
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    link: {
        type: String,
        validate: {
            validator: (url) => {
                return /^(ftp|http|https):\/\/[^ "]+$/.test(url)
            }
        }
    },
    banner: [{
        type: String,
        required: true
    }],
    createdDate: {
        type: Date,
        default: Date.now
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
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
    likes:{
        type: Number,
        default: 0,
        required: false
    },
    comments:[
        {
            username:{
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            message:{
                type: String,
                required: true
            },
            likes: {
                type: Number,
                default: 0
            }
        }
    ]
}

const advertisementSchema = new mongoose.Schema(advertisement)

// Create Index
advertisementSchema.index({ "audienceLocation" : "2dsphere" })

const advertisementModel = mongoose.model('adverts',advertisementSchema)


const advertisementDomain = {
    'advertisementSchema': advertisementSchema,
    'advertisementModel': advertisementModel
}

module.exports = advertisementDomain;