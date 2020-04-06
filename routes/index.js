var express = require('express');
var router = express.Router();

const fservice = require('../service/filestorage-service');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload-demo',function(req,res,next) {
  let postImages = req.files.images instanceof Array ? req.files.images : [req.files.images]

  try{
    fservice.prepareFiles(postImages)
            .renameAs('loremipsum')
            .upload((result) => {
              console.log(`${result}`)
              res.sendStatus(200)
            })
  }catch(e){
      console.log(`${e}`)
      res.sendStatus(500)
  }
 
})






module.exports = router;
