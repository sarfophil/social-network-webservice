/**
 * Security
 */
const Utils = require('../util/apputil')
const jwt = require('../util/jwt')



// Add Permitted Routes to the array
const allowedRoutes = ['/user/login','/user/account','/posts/create','/admin/login']

function shouldPermit(pathName) {
    let flag = Utils.find(allowedRoutes,(route) => route == pathName)
    return flag == null ? false : true
}

const security = {
    authorize : function(req,res,next) {
        if(!shouldPermit(req.originalUrl)){
            let bearer = req.headers.authorization;
            if(bearer){   
                let token = bearer.substring(7);
                jwt.verify(token,(err,decoded) => {
                    if(err){
                        next()
                    
                    }else{   
                        // Adds user info to the request after verifying
                        req.principal = decoded
                        next()
                    }
                })
            }else{   
                next()
            }
        }else{     
            next()
        }
    }
}


module.exports = security