const jwt = require('jsonwebtoken')
const validator = require('validator')
const Customer = require('../../modals/Customer')

const passwordTokenDecode = async (req, res, next) =>{
    try{
        const { otp } = req.body
        const passwordToken = req.headers['passwordauth']

        if(!otp || !validator.isNumeric(otp.toString()) || otp == '')
            res.status(403).send({error:{message:'Otp  is not valid', valid:false}})
        if(!passwordToken || passwordToken == '')
           throw new Error('Invalid Token')
        
        const payload = jwt.verify(passwordToken, process.env.LOGIN_TOKEN_SECRETE.toString())
        if(!payload.id || payload.id == '')
            throw new Error('Invalid paylaod')
        
        const customer = await Customer.findById(payload.id)
        console.log()
        if(!customer){
            console.log('customer not found')
            return res.status(404).send({error:{message:'Invalid request'}})
        }
        if(customer.passwordStatus.passwordToken == ""){
            throw new Error('No password change request')
        }
        const regenerate = customer.passwordStatus.otp.regenerate < 4

        const validOtp = ((Date.now() - customer.passwordStatus.otp.time) <= 180000)
        const tokenExesist = customer.passwordStatus.passwordToken == passwordToken
        if(!tokenExesist || !validOtp){
            return res.status(410).send({error:{message:'Otp expired', expired:true, regenerate}})
        }

        if(otp != customer.passwordStatus.otp.value || !otp){
            return res.status(410).send({error:{message:'Opt does not match', invalid:true, expired:false,regenerate}})
        }
        
        req.customer = customer
        next()
    } catch(e){
        console.log(e)
        return res.status(403).send({error:{message:'Bad request'}, request:false})
    }
}

module.exports = passwordTokenDecode