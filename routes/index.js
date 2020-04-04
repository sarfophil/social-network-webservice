var express = require('express');
var router = express.Router();
const postAdvertisement = require('./post-route');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

<<<<<<< HEAD
router.post('/admin/ads', postAdvertisement.postAdvertisement);
=======




>>>>>>> fd28f1e2d6d761abaafaca92d3544fc59eb0fb99


module.exports = router;
