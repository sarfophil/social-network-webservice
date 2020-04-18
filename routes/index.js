var express = require('express');
var router = express.Router();

const fs = require('fs')
const imageDirectory = require('../public/upload-path')
const User = require('../model/user').getModel
const ws = require('../util/ws-events');
/* GET home page. */
router.get('/', function(req, res, next) {
  ws(['jayp@gmail.com'],{reason: 243,content: 'Lorem Testing'});
  res.render('index', { title: 'Express' });
});



router.get('/download',function(req,res) {
  try {
    let userId = req.query.userId;
    let imagename = req.query.imagename;
    if(!req.query.imagename){
      User.findOne({_id: userId},(err,doc) => {
          if(doc){
            imagename = doc.profilePicture;
          }
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
