const path = require('path');
var fileSystem = require('fs');



const imageUploader = {
    
    upload: (imagPath,mimetype,image,cb) => {
       

        if(image != null && (mimetype != "/jpg" ||mimetype != "image/jpeg"
         || mimetype != "image/png")) {
            fileSystem.writeFile('public/'+new String(imagPath).trim()),image, function (err) {
                if(err)
                cb(-1);
                else cb(1);
            }
        }
    }
}


module.exports = imageUploader