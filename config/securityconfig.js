/**
 * Security
 */
const Utils = require('../util/apputil')
const jwt = require('../util/jwt')



// Add Permitted Routes to the array
const allowedRoutes = ['/user/login','/user/account','/admin/login']

function shouldPermit(pathName) {
    let flag = Utils.find(allowedRoutes,(route) => route == pathName || /\w+\?\w+=\w+\.\w+$/.test('/download?imagename=image.png'))
    return flag == null ? false : true
}

const routes = [
    {route:'admin', role:[]},
    {route:'users', role:[]},
]

/**
 * Method maps roles to routes
 * @param {String} routeArgs 
 */
function route(routeArgs) {
    return {
        hasRole: (role) => {
            routes.map((route) => {
                if(route.route == routeArgs){
                    role.forEach(r => route.role.push(r))
                }
            })
        }
    }
}

function authorizationFilter(request,callback) {
    let pathName = Utils.findAbsPath(req.path);
    let checkRoute = Utils.find(routes,(route) => {
        return route.route == pathName
    })

    if(!checkRoute){       
         //check user role
         let checkRoles = Utils.find(checkRoute.role,(role) => request.principal.role == role)

         if(checkRoles){       
            callback(null,true)
         }else{
             callback('Not permitted',false)
         }
    }

}


const security = {
    configure: function() {
                
        // Web Security
        route('admin').hasRole(['ROLE_ADMIN'])
        route('users').hasRole(['ROLE_USER'])
        return this;
    },
    authorize : function(req,res,next) {
        if(!shouldPermit(req.originalUrl)){
            let bearer = req.headers.authorization;
            if(bearer){   
                let token = bearer.substring(7);
                jwt.verify(token,(err,decoded) => {
                    if(err){
                        console.log(`Token Error: ${err}`)
                        res.status(403).send('Token Expired')                 
                    }else{   
                        //console.log(`Path: ${Utils.findAbsPath(req.path)}`)

                        // Adds user info to the request after verifying
                        req.principal = decoded
                        next()
                    }
                })
            }else{   
                res.sendStatus(403)
            }
        }else{     
            next()
        }
    }
}


module.exports = security