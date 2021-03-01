const mongoose = require('mongoose')

const droneShema = new mongoose.Schema({
    modalName:{
        type:String,
        trim:true,
        uppercase:true,
        required:true
    },
    modalId:{
        type:String,
        trim:true,
        required:true
    },
    //128bit hex autogenerate
    UUID:{
        type:String,
        required:true
    },
    droneNo:{
        type:Number,
        required:true
    },
    buildDate:{
        type:Date,
        required:true
    },
    flightControllerNumber:{
        type:String,
        required:true
    },
    assignedTo:{
        type:String,
        required:true
    },
    keyRegistry:[{
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
    logRegistry:[{
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
    pilotRegistry:[{
        date:{
            type:Date
        },
        email:{
            type:String
        }
    }]
})

droneShema.methods.deregister = async function () {
    var status = false
    // const body = {
    //     "drone" : {
    //       "version" : "1.0.0",
    //       "txn": this.assignedTo,
    //       "deviceId": this.UUID,
    //       "deviceModelId": this.modalId
    //       },
    //   "signature" : "[Base64 Encoded Digital Signature(SHA256withRSA signed)of the drone data and is a mandatory string attribute]" ,
    //   "digitalCertificate" : "[Base64 Encoded X509 Certificate of the manufacturer and is a mandatory string attribute]"
    //   }
    
    // await axios({
    //     method:'patch',
    //     url:'https://digitalsky.dgca.gov.in/api/droneDevice/deregister/<manufacturerBusinessIdentifier>',
    //     header:{
    //         contenType: 'application/json'
    //     },
    //     data:body
    // })
    // .then(response =>{
    //     console.log("success")
    //     console.log(response.data)
    //     status = true
    // }).catch(e => {
    //     console.log("fail")
    //     console.log(e)
    //     status = false
    // })

    status = true
    return status
}

const Drone = mongoose.model('Drone', droneShema)

module.exports = Drone