/**
 * Blocked Account
 */
const mongoose = require('mongoose')
const User = require('./user').getSchema

const blocked = {
    account: {
        type: User,
        required: true
    },
    hasRequestedAReview: { // has requested a review
        type: Boolean,
        default: false
    },
    createdDate:{
        type: Date,
        default: Date.now
    }
}

const blockedSchema = new mongoose.Schema(blocked)
module.exports = mongoose.model('blocked-account',blockedSchema)