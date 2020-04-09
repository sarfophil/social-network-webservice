var express = require('express');
var router = express.Router();

const fservice = require('../service/filestorage-service');
const fs = require('fs')
const imageDirectory = require('../public/upload-path')
const path = require('path')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload-demo',function(req,res,next) {
  let postImages = req.files.images instanceof Array ? req.files.images : [req.files.images]

  try{
    let names = fservice.prepareFiles(postImages).renameAs('loremipsum').upload().getNames();
    console.log(names)
    res.sendStatus(200)
  }catch(e){
      console.log(`${e}`)
      res.sendStatus(500)
  }
 
})

router.get('/download',function(req,res) {
    fs.readFile(imageDirectory.downloadPath()+req.query.imagename,(err,data) => {
       if(err){
          res.sendStatus(404)
       } else {
         res.end(data)
       }
    })
})






module.exports = router;
