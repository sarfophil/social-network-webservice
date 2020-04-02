









// search post
router.get('/search',function(req,res) {
    let username = req.query.query;
    let limit = parseInt(req.query.limit)
    console.log(`${username} - ${limit}`)
    searchService.search(username,limit,(err,doc) => {
       // console.log(doc)
        res.status(200).send(doc)
    })
})