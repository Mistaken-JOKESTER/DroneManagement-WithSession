const mongoose = require('mongoose')

//first i will store modal information in this modal
//than firmware and image of drone will be provided
//if you in case you close window while regestring modal 
//and did not cancle it will go this temperaty storage and
// will get deleted after sometime.

//time after which it delete in milliseconds.
const timeToLive = 5 * 60 * 1000

const temporaryDroneModalSchema = new mongoose.Schema({
    modalName:{
        type:String,
        required:true,
        uppercase:true,
        required:true
    },
    modalNumber:{
        type:String,
        required:true,
        uppercase:true,
        required:true
    },
    wingType:{
        type:String,
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
        // enum:['Nano(+250g)'],
        required:true
    },
    RPASModelPhoto:{
        type:String,
        //required:true
    },
    purposeOfOperation:{
        type:String,
        required:true
    },
    engineType:{
        type:String,
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
    //automatically exipres
    expireAfterSeconds: { 
        type: Date, 
        default: Date.now(), 
        expires:300000
    }
})

temporaryDroneModalSchema.index({expireAfterSeconds:1})

const TEMPDroneModal = mongoose.model('TEMPDroneModal', temporaryDroneModalSchema)

module.exports = TEMPDroneModal



