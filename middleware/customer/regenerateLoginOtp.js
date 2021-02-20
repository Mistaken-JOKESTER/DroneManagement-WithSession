const jwt = require('jsonwebtoken')
const Customer = require('../../modals/Customer')

const regenerateLoginOtp = async (req, res, next) =>{
    try{
        const loginToken = req.headers['loginauth']
        if(!loginToken || loginToken == '')
            throw new Error('Token not defined')
        
        
        const payload = jwt.verify(loginToken, process.env.LOGIN_TOKEN_SECRETE.toString())
        if(!payload.id || payload.id == '')
            throw new Error('Invalid payload')
        
        const customer = await Customer.findById(payload.id)
        if(!customer){
            console.log('customer not found')
            return res.status(404).send({error:{message:'Customer not found'}})
        }
        if(customer.loginStatus.loginToken == ""){
            throw new Error('No login request')
        }

        if(customer.loginStatus.otp.regenerate >= 4){
            await customer.resetLoginStatus()
            return res.status(410).send({error:{message:'You took too long to submit otp, login again.', regenerate:false}})
        }

        await customer.generateAndSendOtp(true)
        req.customer = customer
        next()
    } catch(e){
        console.log(e)
        return res.status(403).send({error:{message:'Invalid request'}, regenerate:false})
    }
}

module.exports = regenerateLoginOtp