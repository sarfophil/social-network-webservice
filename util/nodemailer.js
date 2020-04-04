/**
 * MailGun client for sending Emails
 */
const nodemailer = require('nodemailer');

/**Testing purposes */
const transport = {
    host: 'localhost',
    port: 1025,
    auth: {
        user: 'project.1',
        pass: 'secret.1'
    }
}

// Config
const transporter = nodemailer.createTransport(transport)

const emailTemplate = {
    from: 'social-media@org.com',
    to: [],
    subject: '',
    text: ''
 }

const createEmailAndSend = {
     to: function(to) {
        if(to instanceof Array){    
            emailTemplate.to = to 
        }else{     
            emailTemplate.to.push(to)
        } 
        return this;
    },
    /**
     * Add a Subject
     * @param {String} subject 
     */
     subject: function(subject){
        emailTemplate.subject = subject
        return this;
    },
    /**
     * Adds a body
     * @param {String} text 
     */
     text: function(body) {
        emailTemplate.text = body
        return this;
    },
    /**
     * Sends email to destination
     * @param {Function} callback 
     */
    sendEmail : function(callback){
        transporter.sendMail(emailTemplate, (err, info) => {
            if(err) callback(err)
            callback(info)
        });
    }
}

module.exports =  createEmailAndSend