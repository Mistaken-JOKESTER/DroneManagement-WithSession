const multer = require('multer')
const path = require('path')

const imageAndFirmwareUpload  = multer({
    limits:{fileSize: 10000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb, req)
    }
}).fields([{
    name: 'imageFile', maxCount: 1
},{
    name: 'firmFile', maxCount: 1
}])


function checkFileType(file, cb, req){
    if(file.fieldname=="imageFile"){
        // allowed exte
        const fileTypes = /image|jpeg|jpg|png|gif/
        //check ext
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
        //check mine type
        const mimeType = fileTypes.test(file.mimetype)
        if(mimeType && extname){
            return cb(null, true)
        } else {
            req.multerImageUploadError = 'Please provide jpeg/jpg/png type image of less than 1MB'
            return cb(true, true)
        }
    } else if(file.fieldname=="firmFile"){
        // allowed exte fileTypes
        const fileTypes = /hex|application|octet-stream|bin|px4|apj|application|octet-stream/
        //check ext
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())

        //check mine type
        const mimeType = fileTypes.test(file.mimetype)
        req.fimrFileExtname = path.extname(file.originalname).toLowerCase()
        if(mimeType && extname){
            return cb(null, true)
        } else {
            req.multerFileUploadError = `Please provide check you file type.`
            return cb(null, true)
        }
    }
    
}

module.exports = imageAndFirmwareUpload
