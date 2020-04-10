/** Hashing Passwords */

const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

/**
 * Bcrypt Password Encoder & Decoder
 */
module.exports = {
    encodeSync: (value) => {
        return bcrypt.hashSync(value,SALT_ROUNDS)
    },
    compareSync: (value,encryptedValue) => {
        return bcrypt.compareSync(value,encryptedValue)
    }
}