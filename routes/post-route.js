
module.exports = {

 postAdvertisement: (req, res,err) => {
      if(err){
        return res.status(500).send(err);
}
    res.status(201).json({ad:req.body});
    res.end();
}
};