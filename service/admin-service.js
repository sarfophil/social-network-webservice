const Admin = require('../model/admin').adminModel
const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')

const AdvertModel = require('../model/advertisement').advertisementModel
const fservice = require('../service/filestorage-service')

exports.login = (function(req,res,next){
    const username = req.body.username;
    const password = req.body.password;
    Admin.findOne({email: username},function (err,user) {
      if(err) res.statusCode(403)
      let comparePassword = bcrypt.compareSync(password,user.password) 
      if(comparePassword){
        jwt.sign(user,(err,token) => {
          if(err) {
              res.status(500).send('Unable to sign token')
          }else{ 
            res.status(200).send({access_token: token})
          }
        })
      }else{
        res.sendStatus(403)
      }
    })
})

exports.createAd = function(req,res) {
  console.log(req.body)
    let ad = {
        title: req.body.title,
        content: req.body.content,
        link: req.body.link,
        banner: null, // link
        owner: req.body.owner,
        audienceCriteria:{
            age: JSON.parse(req.body.age_target)
        },
        audienceLocation: {
            coordinates: JSON.parse(req.body.target_location)
        }
    }

    let banners = req.files.banner;

    let adModel = new AdvertModel(ad)

    adModel.validate()
        .then(value => {
            uploadImage(banners,adModel._id,(err,images) => {
                if(err){
                    res.send(err)
                }else{
                    adModel.banner = images
                    adModel.save()
                    res.send({meaage:'Posted'})
                }
            })
        })
        .catch(err => {
            console.log(err.stack)
            res.send('Input Validation Error')
        })
 
}

function uploadImage(images,adId,callback){
  try { 
       let namingPattern = 'ad-'.concat(adId.toString())
       let processedImages = fservice.prepareFiles(images).renameAs(namingPattern).upload().getNames()
       callback(null,processedImages)  
  } catch (error) {
      callback(error,null)
  } 
}
