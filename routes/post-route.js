

module.exports = {

 postAdvertisement: (req, res,err) => {
      if(err){
        return res.status(500).send(err);
}
    res.status(201).json({ad:req.body});
    res.end();
}
  search: (req,res) => {
    let username = req.query.query;
    let limit = parseInt(req.query.limit)
    searchService.search(username,limit,(err,doc) => {
        res.status(200).send(doc)
    })
   }
  
};
