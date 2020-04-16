/**
 * Web Socket
 */
const app = require('express')()
const server = require('http').createServer()
const io = require('socket.io')(server)
const User = require('../model/user').getModel
server.listen(3100,() => console.log(`Web Socket Running {}`))


let conn = () =>{
    io.on('connection',(socket) => {
        socket.on('user_status',function (data) {
            console.log(`Socket notification: ${data}`)
            User.findOne({_id: data.userId},(err,user) => {
                if(data.status === 1){
                    // logout
                    user.isOnline = false;
                    user.save()
                  //  user.update({_id: data.userId},{isOnline: false})
                }else {
                    // login
                    user.isOnline = true
                    user.save()
                    //user.update({_id: user._id},{$set:{'isOnline': true}})
                }
            })

        })
    })
}

conn()

module.exports = async function () {
    let socket = await io.on("connection",(socket) => {
        socket.setMaxListeners(100)
        return socket;
    })
    return Promise.resolve(socket)
}

