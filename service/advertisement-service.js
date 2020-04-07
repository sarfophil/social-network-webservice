/**
 * Advertisement Service is responsible for providing adversitement services
 * All interactions to the database are transactional
 */

const AdvertisementDomain = require('../model/advertisement')
const AdvertisementModel = AdvertisementDomain.advertisementModel;
const userDomain = require('../model/user')
const userModel = userDomain.getModel;
const config = require('../config/properties')

const adversitementImpl = {
    // Method for posting Ad to the platform
    'postAd': function (advert,callback) {
       advert.save().then(()=>{
            callback()
       }).catch(err=>{
           callback(err)
       })
    },
    'loadPostByAdminId':function (adminId,resultCallback) {
        AdvertisementModel.findOne({owner: adminId},(err,doc)=>{
            resultCallback(doc)
        })
    },
    // Method will load post requested by the user. It will depend on the user age and criteria
    'loadAllPost': function (userId,cord,limit,skip,resultCallback) {
       
        userModel.findById({_id: userId},function (err,user) { 
            if(!err)    
                 getPost(user)
        })

        function getPost(user){

           let request =  AdvertisementModel.find(
                {
                    $or: [
                        {"audienceCriteria.age.min": {$eq: user.age}},
                        {"audienceCriteria.age.max": {$gte: user.age}}
                    ],
                    audienceLocation:{
                        $near: {
                            $geometry: {type: "Point",coordinates: cord},
                            $minDistance: config.geoDistance.minDistance,
                            $maxDistance: config.geoDistance.maxDistance
                        }
                    }
                    
                }
            )
            .sort({createdDate: -1})
            .limit(limit)
            .skip(skip)    
            .exec()
           

            request.then((res)=>{
                resultCallback(res)
            }).catch((err)=> console.log(err))

        }

        
      
    }
}



module.exports = adversitementImpl;