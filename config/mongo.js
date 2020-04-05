/**
 * @author SARFO PHILIP
 * Establish database connection
 * */
const mongoose = require('mongoose');
const config = require('../config/properties');

/**
 * Database Connection
 */
const initializeDb = function (callback) {
        mongoose.connect(config.dbConnectionHost+config.dbName,{useNewUrlParser:true,useUnifiedTopology: true},() => {
            callback()
        })
    .catch((err)=>console.error(`${err}`))
}


module.exports = initializeDb;