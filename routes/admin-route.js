var express = require('express');
var router = express.Router();

const blacklistModel = require('../model/blacklistedkeyword');
const postModel = require('../model/post').getModel
const AdvertModel = require('../model/advertisement').advertisementModel
const BlacklistedPostModel = require('../model/blacklistedPost');
const BlockedAccount = require('../model/blocked-account')
const UserModel = require('../model/user').getModel
const nodemailer = require('../util/nodemailer')

const advertService = require('../service/advertisement-service');
const fileStorageService = require('../service/filestorage-service');
const blacklistedPostService = require('../service/blacklistedpost-service');


const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')


// util
const Utils = require('../util/appUtil') 

router.get('/login',function(req,res) {
    let username = req.body.username
    let password = req.body.password
    AdminModel.findOne({email: username},function(err,user){
        if(err) res.statusCode(403)
        let comparePassword = bcrypt.compareSync(password,user.password) 
        if(comparePassword){
          jwt.sign(user,(err,token) => {
             if(err) res.status(500).send('Unable to sign token')
             res.status(200).send({access_token: token})
          })
        }else{
          res.sendStatus(403)
        }
      })
})