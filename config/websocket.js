/**
 * Web Socket
 */
const app = require('express')()
const server = require('http').createServer()
const io = require('socket.io')(server)

server.listen(3100,() => console.log(`Web Socket Running {}`))


let conn = () =>{
    io.on('connection',(socket) => {
        socket.on('loggedIn',function (data) {
            console.log(data)
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

