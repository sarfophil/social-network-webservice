
module.exports = {

 postAdvertisement: (req, res,error) => {
      if(error){
        return res.status(500).send(error);
}
    res.status(201).json({ad:req.body});
    res.end();
}
};