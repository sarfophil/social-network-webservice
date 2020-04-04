/**
 * Jwt Util
 */
const jwt = require('jsonwebtoken');
const config = require('../config/properties')

const jwtImpl = {
    sign : (payload,callback) => {
        jwt.sign({payload},config.jwt.secret,{algorithm: config.jwt.alg,expiresIn: config.jwt.exp},(err,encoded) => {
            if(err) {
                callback(err,null)
            } else {
                callback(null,encoded)
            }
            
        })
    },
    verify : (token,callback) => {
        try {
            const decoded = jwt.verify(token,config.jwt.secret)
            callback(null,decoded)
        } catch (err) {
            callback(err,null)
        }
    }
}

module.exports = jwtImpl