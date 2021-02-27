const mongoose = require('mongoose')

const GCSSchema = new mongoose.Schema({
    version:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    }
})

const GCS = mongoose.model('GCS', GCSSchema)

module.exports = GCS