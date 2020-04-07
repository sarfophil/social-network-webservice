/**
 * List of websocket events
 */
const ws = require('../config/websocket')

/**
 * Method sends ws notification to users
 * @param {events} events 
 * @param {Object} data
 */
const sendNotification = (events,data) =>{      
    ws().then(socket => {
        events.forEach(event => {
            socket.emit(event,data)
        })
    }).catch(err => console.log(`Websocket error: ${err}`))
}

module.exports = sendNotification