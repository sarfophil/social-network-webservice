var express = require('express');
var router = express.Router();


let verify = function (req,res,next) {
    // Token is verified upon reaching here
    res.status(200).send(req.principal.payload)
}

router.get('/verify',verify)


module.exports = router;