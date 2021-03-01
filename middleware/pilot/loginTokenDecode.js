const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const Pilot = require('../../modals/Pilot')
const Drone = require('../../modals/Drone')

const loginTokenDecode = async (req, res, next) =>{
    try{
        const { otp } = req.body
        const loginToken = req.headers['loginauth']

        if(!otp || !validator.isNumeric(otp.toString()) || otp == '')
            res.status(403).send({error:{message:'Otp  is not valid', valid:false}})
        if(!loginToken || loginToken == '')
            throw new Error('Invalid token')
        
        
        const payload = jwt.verify(loginToken, process.env.LOGIN_TOKEN_SECRETE.toString())
        if(!payload.id || payload.id == '' || !payload.droneId || payload.droneId == '')
            throw new Error('Invalid payload.')
        
        const pilot = await Pilot.findById(payload.id)
        if(!pilot){
            return res.status(404).send({error:{message:'Pilot not found.'}})
        }
        if(pilot.loginStatus.loginToken == ""){
            throw new Error('No login request')
        }
        const regenerate = pilot.loginStatus.otp.regenerate < 4

        const validOtp = ((Date.now() - pilot.loginStatus.otp.time) <= 180000)
        const tokenExesist = pilot.loginStatus.loginToken == loginToken
        if(!tokenExesist || !validOtp){
            return res.status(410).send({error:{message:'Otp expired', expired:true, regenerate}})
        }

        if(otp != pilot.loginStatus.otp.value || !otp){
            return res.status(401).send({error:{message:'Opt does not match', invalid:true, expired:false, regenerate}})
        }
        

        const drone = await Drone.updateOne({
            _id:payload.droneId
        },{
            $addToSet:{
                pilotRegistry:{
                    email:pilot.email,
                    date:Date.now()
                }
            }
        })

        if(!drone.nModified){
            return res.status(403).send({error:{message:'Drone not found'}, droneId:false})
        }
        req.pilot = pilot
        next()
    } catch(e){
        console.log(e)
        return res.status(403).send({error:{message:'Invalid request'}})
    }
}

module.exports = loginTokenDecode