/**
 * List of websocket events
 */
const ws = require('../config/websocket')
const Notification = require('../model/notification').notificationModel
const User = require('../model/user').getModel
/**
 * Method sends ws notification to users
 * @param {events} events 
 * @param {Object} data
 */
const sendNotification = (events,data) =>{      
    ws().then(socket => {
        events.forEach(event => {
            User.findOne({email: event},(err,user) => {
                let hasAlerted = true;
                if(user.isOnline){
                    socket.emit(event,data)
                }else{
                    hasAlerted = false;
                }
                console.log(`Message: ${data.content}`)
                let notification = new Notification({
                    message: data.content,
                    messageType: data.reason,
                    topic: event,
                    status: hasAlerted
                })
                notification.save().catch((err)=> {
                    console.log(`${err}`)
                })
            })
        })
    }).catch(err => {
        console.log(`Websocket error: ${err}`)
    })
}

module.exports = sendNotification