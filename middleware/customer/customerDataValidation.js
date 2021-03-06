const sanitize = require('../htmlSanitizer/sanitizer')
const validator = require('validator')
const Customer = require('../../modals/Customer')

async function customerDatavalidation(req, res, next){
    try{
        let { name, email, mobile, password, confPassword } = req.body
        
        const errors = []
        name=sanitize(name)
        email= sanitize(email)
        
        //validating name
        if(validator.isEmpty(name)){
            errors.push('Invlid Name')
        }

        //validating email
        const customer = await Customer.findOne({email})
        if(validator.isEmpty(email) || !validator.isEmail(email) || customer){
            errors.push('Invalid Email')
        }

        //validating mobile
        if(!validator.isNumeric(mobile) || mobile.toString().length != 10){
            errors.push('Invlid Mobile Number')
        }
        
        //validating password
        if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Z]).{8,}/.test(password) || validator.isEmpty(password)){
            errors.push('Password must contain atleast 8 characters, One small, one capital alphabet and one number.')
        }
        if(password !== confPassword){
            errors.push('Password is not matching with confirm password')
        }

        if(errors.length){
            //if any errors pushing them on req.validationError
            req.validationErrors = errors
            req.customerData={
                name: req.body.name,
                email:req.body.email,
                mobile:req.body.mobile
            }
        } else {
            //data of customer saved in database
            req.customerData = {
                name,
                email,
                password,
                mobile
            }
        }
        
        next()
    } catch (e) {
        console.log(e)
        res.status(500).render('pages/505Error')
    }
}

module.exports = customerDatavalidation