const jwt = require('jsonwebtoken')
const Pilot = require('../../modals/Pilot')

const regenerateLoginOtp = async (req, res, next) =>{
    try{
        const loginToken = req.headers['loginauth']
        if(!loginToken || loginToken == '')
            throw new Error('Token not defined')
        
        
        const payload = jwt.verify(loginToken, process.env.LOGIN_TOKEN_SECRETE.toString())
        if(!payload.id || payload.id == '')
            throw new Error('Invalid payload')
        
        const pilot = await Pilot.findById(payload.id)
        if(!pilot){
            console.log('Pilot not found')
            return res.status(404).send({error:{message:'Pilot not found'}})
        }
        if(pilot.loginStatus.loginToken == ""){
            throw new Error('No login request')
        }

        if(pilot.loginStatus.otp.regenerate >= 4){
            await pilot.resetLoginStatus()
            return res.status(410).send({error:{message:'You took too long to submit otp, login again.', regenerate:false}})
        }

        await pilot.generateAndSendOtp(true)
        req.pilot = pilot
        next()
    } catch(e){
        console.log(e)
        return res.status(403).send({error:{message:'Invalid request'}, regenerate:false})
    }
}

module.exports = regenerateLoginOtp