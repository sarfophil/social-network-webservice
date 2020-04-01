/**
 * Admin Model
 */

const mongoose = require('mongoose')

const admin = {
    'fullname':{
        type: String,
        required: true,
        validate: {
            validator: (fullname) =>{
                return (fullname.length >= 5);
              },
            message: props => `${props.value} Validation failed`
        }
    },
    'email': {
        type: String,
        required: true,
        validate: {
            validator: (email) =>{
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
              },
            message: props => `${props.value} Validation failed`
        }
    },
    'password': {
        type: String,
        required: true
    },
    'createdDate':{
        type: Date,
        default: Date.now
    }
}

const adminSchema = new mongoose.Schema(admin);
const adminModel = mongoose.model('sysadmin',adminSchema);

const adminDomain = {
    'adminSchema': adminSchema,
    'adminModel': adminModel
}

module.exports = adminDomain;