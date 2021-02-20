const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const Customer = require('../../modals/Customer')

const loginTokenDecode = async (req, res, next) =>{
    try{
        const { otp } = req.body
        const loginToken = req.headers['loginauth']

        if(!otp || !validator.isNumeric(otp.toString()) || otp == '')
            res.status(403).send({error:{message:'Otp  is not valid', valid:false}})
        if(!loginToken || loginToken == '')
            throw new Error('Invalid token')
        
        
        const payload = jwt.verify(loginToken, process.env.LOGIN_TOKEN_SECRETE.toString())
        if(!payload.id || payload.id == '')
            throw new Error('Invalid payload.')
        
        const customer = await Customer.findById(payload.id)
        if(!customer){
            return res.status(404).send({error:{message:'Customer not found.'}})
        }
        if(customer.loginStatus.loginToken == ""){
            throw new Error('No login request')
        }
        const regenerate = customer.loginStatus.otp.regenerate < 4

        const validOtp = ((Date.now() - customer.loginStatus.otp.time) <= 180000)
        const tokenExesist = customer.loginStatus.loginToken == loginToken
        if(!tokenExesist || !validOtp){
            return res.status(410).send({error:{message:'Otp expired', expired:true, regenerate}})
        }

        if(otp != customer.loginStatus.otp.value || !otp){
            return res.status(401).send({error:{message:'Opt does not match', invalid:true, expired:false, regenerate}})
        }
        
        req.customer = customer
        next()
    } catch(e){
        console.log(e)
        return res.status(403).send({error:{message:'Invalid request'}})
    }
}

module.exports = loginTokenDecode