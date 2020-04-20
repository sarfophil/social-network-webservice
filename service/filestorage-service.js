/**
 * File Storage service
 * 
 * @usage
 *  prepareFiles(images).renameAs('pattern').upload((res) => res)
 */

const allowedMimeType = ['image/jpeg','image/png']
const uploadDirectory = require('../public/upload-path')



/**
 * Checks image extension
 * @param {String} mimeType 
 */
const validateImageExtension = function (mimeType) {
    let test = allowedMimeType.find(type => type == mimeType)
    return test != undefined ? true : false;
}


let processImages = []


/**
 * Method renames all images provided
 * @param {string} pattern is used to rename files. It can be a post Id or user Id
 */
function rename(pattern){
    let count = 0;
    processImages.forEach(image => {
        const getExtension = image.name.split('.')
        image.name = pattern.concat(count++).concat('.').concat(getExtension[getExtension.length-1])
    })

    
    return {
        upload: upload
    };
}

/**
 * Method is finally called to move files to the upload directory
 * @param {Function} callback 
 */
function upload(){
    let result = []
    
    processImages.forEach(image => {
        // move files to server directory
        image.mv(uploadDirectory.getPath().concat(image.name),(err) => {  
            if(err){
                throw new Error('Unable to upload pictures')
            }
        })

        // Add image names
        result.push(image.name)

    })
    return {
        getNames: () => result
    }
}




/**
 * Upload Module for moving files to our server.
 * Before image can be uploaded, it should process 2 stages before uploading
 * {Usage} 
 */
const uploadModule = {   
    /**
     * Prepares images for next method `renameAs`
     * @param {any} images 
     */
    prepareFiles: function(images) {
        processImages = [];
        if(images instanceof Array){
            console.log(`Images: ${images.length} image(s)`)
            images.forEach(image => {
                if(!validateImageExtension(image.mimetype)) throw new Error('Invalid File Extension')
                else{
                    processImages.push(image)
                }
            })
        }else {
            // single picture
            if(images)
                processImages.push(images)
        }

        return {
             renameAs: rename
        };
    },
   
    
}

module.exports = uploadModule