/**
 * Web Socket
 */
const app = require('express')()
const server = require('http').createServer()
const io = require('socket.io')(server)
const User = require('../model/user').getModel
const Admin = require('../model/admin').adminModel
server.listen(3100,() => console.log(`Web Socket Running {}`))

/**
 * Application events
 */
let conn = () =>{
    io.on('connection',(socket) => {
        userEventListener(socket);
        adminEventListener(socket);
    })
}

conn()

/**
 * User Event Listener
 * @param socket
 */
function userEventListener(socket){
    socket.on('user_status',function (data) {
        console.log(`Socket notification: ${data}`)
        User.findOne({_id: data.userId},(err,user) => {
            console.log(`Status : ${data.status}`)
            if(data.status === 1){
                // logout
                console.log(`${user.username} logged out`)
                user.isOnline = false;
                user.save()
                //  user.update({_id: data.userId},{isOnline: false})
            }else {
                // login
                console.log(`${user.username} logged in`)
                user.isOnline = true
                user.save()
                //user.update({_id: user._id},{$set:{'isOnline': true}})
            }
        })

    })
}

/**
 * Admin Event Listener
 * @param socket
 */
function adminEventListener(socket){
    socket.on('admin_status',function (data) {
        Admin.findOne({_id: data.userId},(err,user) => {
            if(data.status === 1){
                user.isOnline = false
                user.save()
            }else {
                user.isOnline = true
                user.save()
            }
        })
    })
}

module.exports = async function () {
    let socket = await io.on("connection",(socket) => {
        socket.setMaxListeners(100)
        return socket;
    })
    return Promise.resolve(socket)
}

