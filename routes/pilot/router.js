const validator = require('validator')
const router = require('express').Router()
const jwt = require('jsonwebtoken')

const passwordTokenDecode = require('../../middleware/pilot/passwordTokenDecode')
const regeneratePasswordOtp = require('../../middleware/pilot/regeneratePasswordOtp')
const resetPasswordDecode = require('../../middleware/pilot/resetPasswordDecode')

const Mail = require('../../middleware/sendMail/emailTemplets')
const pilotAuth = require('../../middleware/pilot/pilotAuth')

const Pilot = require('../../modals/Pilot')
const Drone = require('../../modals/Drone')

router.get('/', (req, res) => {
    try{
        res.send({message:'Welcome to drone Point Pilot api.'})
    }catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.post('/login', async (req, res) =>{
    try{
        const { email, password, droneId } = req.body

        if(!droneId)
            return res.status(403).send({error:{message:'Please provide valid DroneId', email: email && 1, password: password && 1, droneId:false}})

        if(!email || !password || email == '' || password == '' || !validator.isEmail(email))
            return res.status(403).send({error:{message:'Invalid email or password.', email: email && 1, password: password && 1}})

        const pilot = await Pilot.findByCredentials(email, password)
        if(!pilot)
            return res.status(404).send({error:{message:'Invalid email or password.'}})
        
        const drone = await Drone.updateOne({
            _id:droneId
        },{
            $addToSet:{
                pilotRegistry:{
                    email:pilot.email,
                    date:Date.now()
                }
            }
        })

        if(!drone.nModified){
            return res.status(403).send({error:{message:'Drone not found'}, droneId:false})
        }

        const accessToken = await pilot.permanentToken()
        res.send({message:`Welcome, ${pilot.name}`, accessToken})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/profile', pilotAuth, (req, res) =>{
    try{
        const pilot = {message:`Welcome back ${req.pilot.name}`,
            name: req.pilot.name, 
            email:req.pilot.email, 
            mobile:req.pilot.mobile,
            loginStatus:true
        }
        res.send(pilot)
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.post('/forgotPassword', async (req, res) => {
    try{
        const { email } = req.body
        if(!email || !validator.isEmail(email))
            return res.status(422).send({error:{message:'Provide a valid E-mail.'}, email:false})

        const pilot = await Pilot.findOne({email})
        if(!pilot)
            return res.status(422).send({error:{message:'Provide a valid E-mail.'}, email:false})

        const passwordToken = await pilot.passwordChangeRequest(false)
        res.send({message:`Please verify by entering otp send to ${email}`, passwordToken, regenerate:true})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/regeneratePasswordOtp', regeneratePasswordOtp, async (req, res) => {
    try{
        const regenerate = req.pilot.passwordStatus.otp.regenerate < 4
        res.send({message:`Enter the new OTP sent to ${req.pilot.email}`, regenerate})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.post('/passwordChangeOtp', passwordTokenDecode, async (req, res) => {
    try{
        console.log(req.pilot.passwordStatus.otp.value, req.pilot._id)
        const newPasswordToken = await jwt.sign({
            id: req.pilot._id, 
            otp:req.pilot.passwordStatus.otp.value.toString()
        }, 
            process.env.LOGIN_TOKEN_SECRETE.toString(), 
        {
            algorithm: "HS256",
            expiresIn: 300000
        })

        res.send({message: 'Send new Password with this token. Password must include atleast one capitacl, small letter and a number', newPasswordToken})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.post('/resetPassword', resetPasswordDecode, async (req, res) => {
    try{
        const { newPassword } = req.body
        if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Z]).{8,}/.test(newPassword) || validator.isEmpty(newPassword)){
            return res.status(400).send({error:{message:'Password does not meet our requirements'}})
        }

        await req.pilot.resetPassword(newPassword)
        res.send({message:'Your password is changed successfully'})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/changePassword', pilotAuth, async (req, res) => {
    try{
        const passwordToken = await req.pilot.passwordChangeRequest(false)
        res.send({message:`Please verify by entering otp send to ${req.pilot.email}`, passwordToken, regenerate:true})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/logout', pilotAuth, async (req, res) =>{
    try{
        req.pilot.accessTokens = []
        await req.pilot.save()
        res.send({message:`${req.pilot.name}, you are loged out Successfuly!`})
    } catch(e){
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/deleteAccount', pilotAuth, async (req, res) => {
    try{
        await req.pilot.deleteAccountRequest(false)
        res.send({message:'Please verify with otp send to your mail', deleteStatus:'pending'})
    } catch(e){
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/regenerateDeleteAccountOtp', pilotAuth, async(req, res) => {
    try{
        const regenerate = req.pilot.deleteStatus.otp.regenerate < 4
        if(!regenerate){
            return res.send({error:{message:'You cannot regenrate more otp'}, regenerate:false, deleteStatus:'pending'})
        }

        await req.pilot.deleteAccountRequest(true)
        res.send({message:'Please verify with otp send to your mail', deleteStatus:'pending', regenerate:true})
    } catch(e){
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.post('/deleteAccountOtp', pilotAuth, async (req, res) => {
    try{
        if(!req.pilot.deleteStatus.status)
            return res.status(403).send({error:{message:'There is no delete account request'}})

        const {otp} = req.body
        const regenerate = req.pilot.deleteStatus.otp.regenerate < 4

        if(!otp || otp == '' || !validator.isNumeric(otp.toString()) || otp !== req.pilot.deleteStatus.otp.value)
            return res.status(410).send({error:{message:'Invalid Otp', valid:false, regenerate}})

        const validTime = (Date.now() -req.pilot.deleteStatus.otp.time) < 180000
        if(!validTime && !regenerate){
            await req.pilot.resetDeleteStatus()
            return res.status(410).send({error:{message:'Your all tries are failed please login agian and then try.', regenerate, expired:true, deleteStatus:'failed'}})
        }
        if(!validTime){
                return res.status(403).send({error:{message:'otp expired.', expired: true, regenerate}})
        }

        await req.pilot.remove()
        Mail('AccountDeleted', req.pilot.email, {name:req.pilot.name})
        res.send({message:'Your account is deleted succesfully', deleteStatus:'success'})
    } catch(e){
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/deleteAccountRequestCancle', pilotAuth, async (req, res) => {
    try{
        await req.pilot.resetDeleteStatus()
        res.send({messag:'Delete account request cancled.'})
    } catch(e) {
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

module.exports = router