const sanitize = require('../htmlSanitizer/sanitizer')
const validator = require('validator')
const Pilot = require('../../modals/Pilot')

async function pilotDatavalidation(req, res, next){
    try{
        let { name, email, mobile, password } = (JSON.parse(JSON.stringify(req.body)))
        
        const errors = []
        name=sanitize(name)
        email= sanitize(email)
        
        //validating name
        if(validator.isEmpty(name)){
            errors.push('Invlid Name')
        }

        //validating email
        const pilot = await Pilot.findOne({email})
        if(validator.isEmpty(email) || !validator.isEmail(email) || pilot){
            errors.push('Email already registered.')
        }

        //validating mobile
        if(!validator.isNumeric(mobile) || mobile.toString().length != 10){
            errors.push('Invlid Mobile Number')
        }
        
        //validating password
        if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Z]).{8,}/.test(password) || validator.isEmpty(password)){
            errors.push('Password must contain atleast 8 characters, One small, one capital alphabet and one number.')
        }

        if(!req.file){
            errors.push('Unable to upload certificate.')
        } else if(req.multerFileUploadError){
            errors.push('Please check your file and reupload.')
        }

        if(errors.length){
            //if any errors pushing them on req.validationError
            req.validationErrors = errors
            req.pilotData={
                name: req.body.name,
                email:req.body.email,
                mobile:req.body.mobile
            }
        } else {
            //data of pilot saved in database
            req.pilotData = {
                name,
                email,
                password,
                mobile,
                cerificate:req.file.buffer
            }
        }
        
        next()
    } catch (e) {
        console.log(e)
        res.status(500).render('pages/505Error')
    }
}

module.exports = pilotDatavalidation