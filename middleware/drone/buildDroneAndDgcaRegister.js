const uuidGenerate = require('./uuidGenerate')
const axios = require('axios')

const buildDrone = async (body) => {
    delete body.valid
    body.data.UUID = await uuidGenerate()
    const status = await registerOnDgca(body.data)
    return {status, body}
}

const registerOnDgca = async (body) => {
    let status = false
    drone = {
        drone : {
            droneTypeId: parseInt(body.droneNo),
            version : "1.0.0",
            txn: body.assignedTo,
            deviceId: body.UUID,
            deviceModelId: body.modalId,
            operatorBusinessIdentifier : process.env.OPERATORBUSINESSIDENTIFIER
        },
        //"signature" : "[Base64 Encoded Digital Signature(SHA256withRSA signed)of the drone data in raw json form and is a mandatory string attribute]" ,
        //"digitalCertificate" : "[Base64 Encoded X509 Certificate of the manufacturer and is a mandatory string attribute]"
    }
    const data = JSON.stringify(drone)

    // await axios({
    //     method: 'post',
    //     url: `https://digitalsky.dgca.gov.in/api/droneDevice/register/${process.env.MANUFACTURERBUSINESSIDENTIFIER}`,
    //     headers: {'Content-Type': 'application/json'},
    //     data 
    //   }).then(res => {
    //       console.log(response.data)
    //       status = true
    //   }).cathc(e => {
    //     console.log("fail")
    //     console.log(e.request.outputData.forEach(element => {
    //       console.log(element)  
    //     }))
    //       status = false
    //   })
    
    //console.log(data)
    status = true
    return status
} 


module.exports = buildDrone

// {
//     "drone" : {
//        "droneTypeId": "[mandatory attribute of type integer]",
//       "version" : "[version of api as string and is mandatory]",
//       "txn": "[transaction identifier (mandatory string attribute of max length 50) entered by manufacturer, which is also returned as part of response as is and is useful for linking transactions full round trip across systems]",
//       "deviceId": "[Unique Drone Device Id which is a mandatory string attribute]",
//       "deviceModelId": "[mandatory attribute of type string]",
//       "operatorBusinessIdentifier" : "[Operator Unique identifier to be linked to the drone device which is mandatory string attributeof max length 36]",
//       "idHash" : "[optional string attribute]",
//       },
//   "signature" : "[Base64 Encoded Digital Signature(SHA256withRSA signed)of the drone data in raw json form and is a mandatory string attribute]" ,
//   "digitalCertificate" : "[Base64 Encoded X509 Certificate of the manufacturer and is a mandatory string attribute]"
//   }