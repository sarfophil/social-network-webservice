/**
 * Web Socket
 */
const app = require('express')()
const server = require('http').createServer()
const io = require('socket.io')(server)

server.listen(3100,() => console.log(`Web Socket Running {}`))


module.exports = async function () {
    let socket = await io.on("connection",(socket) => {
        return socket;
    })
    return Promise.resolve(socket)
}

