const jwt = require('jsonwebtoken')
const Customer = require('../../modals/Customer')

const resetPasswordDecode = async (req, res, next) =>{
    try{
        const passwordToken = req.headers['passwordauth']
        if(!passwordToken || passwordToken == '')
            throw new Error('Token not defined')
        
        const payload = jwt.verify(passwordToken, process.env.LOGIN_TOKEN_SECRETE.toString())
        if(!payload.id || payload.id == '' || !payload.otp || payload.otp == '')
            throw new Error('Invalid payload')
        
        const customer = await Customer.findById(payload.id)
        if(!customer || payload.otp != customer.passwordStatus.otp.value){
            return res.status(404).send({error:{message:'Customer not found'}})
        }

        req.customer = customer
        next()
    } catch(e){
        console.log(e)
        return res.status(403).send({error:{message:'Invalid request'}})
    }
}

module.exports = resetPasswordDecode