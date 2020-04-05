const path = require('path');
var fileSystem = require('fs');
const mongoose = require('mongoose');



const imageUploader = {
    type: String,
    path: String,
    "mimetype":String,
    image:null,
    upload: ( cb) => {
        
        if(image != null && (mimetype != "/jpg" ||mimetype != "image/jpeg"
         || mimetype != "image/png")) {
            fileSystem.writeFile('public/' + path, image, function (err) {
                if(err)
                cb(-1);
                else cb(1);
            });
        }
    }
}


module.exports = imageUploader