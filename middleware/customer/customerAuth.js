const jwt = require('jsonwebtoken')
const Customer = require('../../modals/Customer')

const customerAuth = async (req, res, next) =>{
    try{
        const accessToken = req.headers['auth']
        if(!accessToken){
            throw new Error()
        }
        
        const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const customer = await Customer.findById(payload.id)
        if(!customer){
            throw new Error()
        }

        const tokenExesist = customer.accessTokens.includes(accessToken)
        if(!tokenExesist || !customer.verificationStatus){
            throw new Error()
        }
        
        req.customer = customer
        next()
    } catch(e){
        return res.status(403).send({error:{message:'Please Login', }, loginStatus:false})
    }

}

module.exports = customerAuth