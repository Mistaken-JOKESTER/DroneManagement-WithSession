const multer = require('multer')
const path = require('path')

const uploadKey  = multer({
    fileFilter: function(req, file, cb){
        checkFileType(file, cb, req, 'key')
    }
}).single('keyFile')


const uploadLog  = multer({
    fileFilter: function(req, file, cb){
        checkFileType(file, cb, req, 'log')
    }
}).single('logFile')


const uploadFirm  = multer({
    fileFilter: function(req, file, cb){
        checkFileType(file, cb, req, 'firm')
    }
}).single('firmFile')


function checkFileType(file, cb, req, value){
    // allowed exte fileTypes
    let fileTypes
    if(value == 'key'){
        fileTypes = /pem|application|octet-stream|der/
    } else if(value == 'log'){
        fileTypes = /application|json/
    } else if(value == 'firm'){
        fileTypes = /hex|application|octet-stream|bin|apj|px4|application|octet-stream/
    }
    //check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    req.extname = path.extname(file.originalname).toLowerCase()

    //check mine type
    const mimeType = fileTypes.test(file.mimetype)
    console.log(mimeType, extname)

    if(mimeType && extname){
        return cb(null, true)
    } else {
        req.multerFileUploadError = `Please provide check you ${value} file type.`
        return cb(null, true)
    }
}

module.exports = {uploadKey, uploadLog, uploadFirm}
