var express = require('express');
var router = express.Router();

const fs = require('fs')
const imageDirectory = require('../public/upload-path')
const User = require('../model/user').getModel

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/download',function(req,res) {
  try {
    let userId = req.query.userId;
    let imagename = req.query.imagename;
    if(!req.query.imagename){
      User.findOne({_id: userId},(err,doc) => {
          imagename = doc.profilePicture;
      })
    }

    fs.readFile(imageDirectory.downloadPath()+imagename,(err,data) => {
      if(err){
          res.sendStatus(404)
      } else {
        res.end(data)
      }
    })
  } catch (error) {
      res.sendStatus(404)
  }
    
})






module.exports = router;
