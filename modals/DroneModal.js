const mongoose = require('mongoose')

//this is permanet modal for storing drone information
//Before storing modal thorugh this 
//All information is provided first
//than firmware and image of that drone is required
//After all this and verification DroneModal will be stroed in database

const droneModalSchema = new mongoose.Schema({
    modalName:{
        type:String,
        required:true,
        uppercase:true,
        trim:true,
        required:true
    },
    modalNumber:{
        type:String,
        required:true,
        uppercase:true,
        trim:true,
        required:true
    },
    wingType:{
        type:String,
        trim:true,
        lowercase:true,
        required:true
    },
    maxTakeOffWeight:{
        type:Number,
        required:true
    },
    maxHeightAttainable:{
        type:Number,
        required:true
    },
    compatiblePayload:{
        type:Number,
        required:true
    },
    droneCategoryType:{
        type:String,
        trim:true,
        lowercase:true,
        required:true
    },
    modalImage:{
        type:Buffer,
        required:true
    },
    purposeOfOperation:{
        type:String,
        trim:true,
        lowercase:true,
        required:true
    },
    engineType:{
        type:String,
        trim:true,
        lowercase:true,
        required:true
    },
    enginePower:{
        type:Number,
        required:true
    },
    engineCount:{
        type:Number,
        required:true
    },
    fuelCapacity:{
        type:Number,
        required:true
    },
    propellerDetails:{
        type:String,
        trim:true,
        lowercase:true,
        required:true
    },
    maxEndurance:{
        type:Number,
        required:true
    },
    maxRange:{
        type:Number,
        required:true
    },
    maxSpeed:{
        type:Number,
        required:true
    },
    length:{
        type:Number,
        required:true
    },
    breadth:{
        type:Number,
        required:true
    },
    height:{
        type:Number,
        required:true
    },
    inAir:{
        type:Number,
        default:0
    },
    firmwareRegistry:[{
        version:String,
        fieldname: String,
        originalname: String,
        encoding: String,
        mimetype: String,
        buffer:Buffer,
        size:Number,
        date:{
            type:Date,
            default:Date.now()
        }
    }],
    latestFirmware:{
        version:String,
        fieldname: String,
        originalname: String,
        encoding: String,
        mimetype: String,
        buffer:Buffer,
        size:Number,
        date:{
            type:Date,
            default:Date.now()
        }
    }
})

const DroneModal = mongoose.model('DroneModal', droneModalSchema)

module.exports = DroneModal