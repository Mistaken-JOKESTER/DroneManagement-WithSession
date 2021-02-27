const jwt = require('jsonwebtoken')
const Pilot = require('../../modals/Pilot')

const pilotAuth = async (req, res, next) =>{
    try{
        const accessToken = req.headers['auth']
        if(!accessToken){
            throw new Error()
        }
        
        const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const pilot = await Pilot.findById(payload.id)
        if(!pilot){
            throw new Error()
        }

        const tokenExesist = pilot.accessTokens.includes(accessToken)
        if(!tokenExesist || !pilot.verificationStatus){
            throw new Error()
        }
        
        req.pilot = pilot
        next()
    } catch(e){
        return res.status(403).send({error:{message:'Please Login', }, loginStatus:false})
    }

}

module.exports = pilotAuth