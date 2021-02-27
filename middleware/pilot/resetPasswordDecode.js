const jwt = require('jsonwebtoken')
const Pilot = require('../../modals/Pilot')

const resetPasswordDecode = async (req, res, next) =>{
    try{
        const passwordToken = req.headers['passwordauth']
        if(!passwordToken || passwordToken == '')
            throw new Error('Token not defined')
        
        const payload = jwt.verify(passwordToken, process.env.LOGIN_TOKEN_SECRETE.toString())
        if(!payload.id || payload.id == '' || !payload.otp || payload.otp == '')
            throw new Error('Invalid payload')
        
        const pilot = await Pilot.findById(payload.id)
        if(!pilot || payload.otp != pilot.passwordStatus.otp.value){
            return res.status(404).send({error:{message:'Pilot not found'}})
        }

        req.pilot = pilot
        next()
    } catch(e){
        console.log(e)
        return res.status(403).send({error:{message:'Invalid request'}})
    }
}

module.exports = resetPasswordDecode