const multer = require('multer')
const path = require('path')
const { nextTick } = require('process')

const certiUpload  = multer({
    fileFilter: function(req, file, cb){
        checkFileType(file, cb, req, 'key')
    }

}).single('certificate')


function checkFileType(file, cb, req, value){
    // allowed exte fileTypes
    let fileTypes = /png|jpg|jpeg|pdf/
    
    //check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    req.extname = path.extname(file.originalname).toLowerCase()

    //check mine type
    const mimeType = fileTypes.test(file.mimetype)
    
    if(mimeType && extname){
        return cb(null, true)
    } else {
        req.multerFileUploadError = `error`
        return cb(null, true)
    }
}

module.exports = certiUpload