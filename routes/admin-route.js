var express = require('express');
var router = express.Router();

const blacklistModel = require('../model/blacklistedkeyword');
const postModel = require('../model/post').getModel
const AdvertModel = require('../model/advertisement').advertisementModel
const BlacklistedPostModel = require('../model/blacklistedPost');
const BlockedAccount = require('../model/blocked-account')
const UserModel = require('../model/user').getModel
const nodemailer = require('../util/nodemailer')