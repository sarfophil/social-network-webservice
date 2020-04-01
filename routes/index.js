var express = require('express');
var router = express.Router();
const postAdvertisement = require('./post-route');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/admin/ads', postAdvertisement.postAdvertisement);


module.exports = router;
