const jwt = require('jsonwebtoken')
const Pilot = require('../../modals/Pilot')

const regeneratePasswordOtp = async (req, res, next) =>{
    try{
        const passwordToken = req.headers['passwordauth']
        if(!passwordToken || passwordToken == '')
            throw new Error('Token not defined')
        
        
        const payload = jwt.verify(passwordToken, process.env.LOGIN_TOKEN_SECRETE.toString())
        if(!payload.id || payload.id == '')
            throw new Error('Invalid payload')
        
        const pilot = await Pilot.findById(payload.id)
        if(!pilot){
            console.log('Pilot not found')
            return res.status(404).send({error:{message:'Pilot not found'}})
        }

        if(pilot.passwordStatus.otp.regenerate >= 4){
            await pilot.resetPasswordStatus()
            return res.status(410).send({error:{message:'You took too long to submit otp, login again.', regenerate:false}})
        }

        await pilot.passwordChangeRequest(true)
        req.pilot = pilot
        next()
    } catch(e){
        console.log(e)
        return res.status(403).send({error:{message:'Invalid request'}})
    }
}

module.exports = regeneratePasswordOtp