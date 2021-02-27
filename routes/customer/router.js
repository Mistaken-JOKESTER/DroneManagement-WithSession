const validator = require('validator')
const router = require('express').Router()
const jwt = require('jsonwebtoken')

const loginTokenDecode = require('../../middleware/customer/loginTokenDecode')
const regenerateLoginOtp = require('../../middleware/customer/regenerateLoginOtp')

const passwordTokenDecode = require('../../middleware/customer/passwordTokenDecode')
const regeneratePasswordOtp = require('../../middleware/customer/regeneratePasswordOtp')
const resetPasswordDecode = require('../../middleware/customer/resetPasswordDecode')

const Mail = require('../../middleware/sendMail/emailTemplets')
const customerAuth = require('../../middleware/customer/customerAuth')
const { uploadKey, uploadLog } = require('../../middleware/upload/keyLogFirmUpload')

const Customer = require('../../modals/Customer')
const Drone = require('../../modals/Drone')
const DroneModal = require('../../modals/DroneModal')

router.get('/', (req, res) => {
    try{
        res.send({message:'Welcome to drone Point cusotmer api.'})
    }catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.post('/login', async (req, res) =>{
    try{
        const { email, password } = req.body

        if(!email || !password || email == '' || password == '' || !validator.isEmail(email))
            return res.status(403).send({error:{message:'Invalid email or password.', email: email && 1, password: password && 1}})

        const customer = await Customer.findByCredentials(email, password)
        if(!customer)
            return res.status(404).send({error:{message:'Invalid email or password.'}})
        
        const loginToken = await customer.generateAndSendOtp(false)
        res.send({message:`Please valid by entering otp send to ${email}`, loginToken, regenerate:true})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})


//otpvalidation --> loginOtp
router.post('/loginOtp', loginTokenDecode, async (req, res) =>{
    try{
        const accessToken = await req.customer.permanentToken()
        res.send({message:`Welcome, ${req.customer.name}`, accessToken})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/regenerateLoginOtp', regenerateLoginOtp, async (req, res) => {
    try{
        const regenerate = req.customer.loginStatus.otp.regenerate < 4
        res.send({message:`Enter the new OTP sent to ${req.customer.email}`, regenerate})
    } catch(e) {
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/profile', customerAuth, (req, res) =>{
    try{
        const customer = {message:`Welcome back ${req.customer.name}`,
            name: req.customer.name, 
            email:req.customer.email, 
            mobile:req.customer.mobile,
            loginStatus:true
        }
        res.send(customer)
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

        const customer = await Customer.findOne({email})
        if(!customer)
            return res.status(422).send({error:{message:'Provide a valid E-mail.'}, email:false})

        const passwordToken = await customer.passwordChangeRequest(false)
        res.send({message:`Please verify by entering otp send to ${email}`, passwordToken, regenerate:true})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/regeneratePasswordOtp', regeneratePasswordOtp, async (req, res) => {
    try{
        const regenerate = req.customer.passwordStatus.otp.regenerate < 4
        res.send({message:`Enter the new OTP sent to ${req.customer.email}`, regenerate})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.post('/passwordChangeOtp', passwordTokenDecode, async (req, res) => {
    try{
        console.log(req.customer.passwordStatus.otp.value, req.customer._id)
        const newPasswordToken = await jwt.sign({
            id: req.customer._id, 
            otp:req.customer.passwordStatus.otp.value.toString()
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

        await req.customer.resetPassword(newPassword)
        res.send({message:'Your password is changed successfully'})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/changePassword', customerAuth, async (req, res) => {
    try{
        const passwordToken = await req.customer.passwordChangeRequest(false)
        res.send({message:`Please verify by entering otp send to ${req.customer.email}`, passwordToken, regenerate:true})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/logout', customerAuth, async (req, res) =>{
    try{
        req.customer.accessTokens = []
        await req.customer.save()
        res.send({message:`${req.customer.name}, you are loged out Successfuly!`})
    } catch(e){
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/deleteAccount', customerAuth, async (req, res) => {
    try{
        await req.customer.deleteAccountRequest(false)
        res.send({message:'Please verify with otp send to your mail', deleteStatus:'pending'})
    } catch(e){
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/regenerateDeleteAccountOtp', customerAuth, async(req, res) => {
    try{
        const regenerate = req.customer.deleteStatus.otp.regenerate < 4
        if(!regenerate){
            return res.send({error:{message:'You cannot regenrate more otp'}, regenerate:false, deleteStatus:'pending'})
        }

        await req.customer.deleteAccountRequest(true)
        res.send({message:'Please verify with otp send to your mail', deleteStatus:'pending', regenerate:true})
    } catch(e){
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.post('/deleteAccountOtp', customerAuth, async (req, res) => {
    try{
        if(!req.customer.deleteStatus.status)
            return res.status(403).send({error:{message:'There is no delete account request'}})

        const {otp} = req.body
        const regenerate = req.customer.deleteStatus.otp.regenerate < 4

        if(!otp || otp == '' || !validator.isNumeric(otp.toString()) || otp !== req.customer.deleteStatus.otp.value)
            return res.status(410).send({error:{message:'Invalid Otp', valid:false, regenerate}})

        const validTime = (Date.now() -req.customer.deleteStatus.otp.time) < 180000
        if(!validTime && !regenerate){
            await req.customer.resetDeleteStatus()
            return res.status(410).send({error:{message:'Your all tries are failed please login agian and then try.', regenerate, expired:true, deleteStatus:'failed'}})
        }
        if(!validTime){
                return res.status(403).send({error:{message:'otp expired.', expired: true, regenerate}})
        }

        await req.customer.remove()
        //Mail('AccountDeleted', req.customer.email, {name:req.customer.name})
        res.send({message:'Your account is deleted succesfully', deleteStatus:'success'})
    } catch(e){
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

router.get('/deleteAccountRequestCancle', customerAuth, async (req, res) => {
    try{
        await req.customer.resetDeleteStatus()
        res.send({messag:'Delete account request cancled.'})
    } catch(e) {
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

//gcs version
router.get('/GCSVersion', async (req, res) => {
    try{
        const GCSVersion = await GCS.findOne()
        if(!GCSVersion || !GCSVersion.version){
            res.send({error:{message:'GCS version not found.'}})
        }
        res.send({GCSVersion:GCSVersion.version})
    } catch(e) {
        console.log(e.message)
        res.status(500).send({error:{message:'Server is down right now', serverDown:true}})
    }
})

//response changed
router.post('/checkMyDrone', customerAuth, async (req, res) => {
    try{
        const { flightControllerNumber } = req.body
        if(!req.body.flightControllerNumber)
            return res.status(403).send({error:{message:'Please Provide flight controller number.', flightControllerNumber:false}})
        
        const drone = await Drone.findOne({flightControllerNumber: req.body.flightControllerNumber, assignedTo:req.customer.email})
        if(!drone){
            return res.status(404).send({error:{message:"Your don't own a drone with this flightController Number."}})
        }

        res.send({registered:true, modalId:drone.modalId, flightControllerNumber: drone.flightControllerNumber,id:drone._id})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:"Internal Server errror", serverDown:true}})
    }
})

router.get('/allFirmware/:id', customerAuth, async (req, res) =>{
    try{
        const { id } = req.params
        console.log(id)
        if(!id || id == "")
            return res.status(403).send({error:{message:'Provide a modal id for firmware.', id:false}})
        
        const modal = await DroneModal.findById(req.params.id, {'firmwareRegistry.version':1,'firmwareRegistry.date':1, 'firmwareRegistry._id':1})

        if(!modal){
            return res.status(404).send({error:{message:'There is no modal with this id.', id:false}})
        }

        res.send(modal)
    } catch {
        console.log(e)
        res.status(500).send({error:{message:"Something went wrong Please try again. This is an internal error"}})
    }
})

//query to praamas for id
router.get('/latestFirmwareVersion/:id', customerAuth, async (req, res) =>{
    try {
        const { id } = req.params
        console.log(id)
        if(!id || id == "")
            return res.status(403).send({error:{message:'Provide a modal id for latest firmware version.', id:false}})
           
        const firm = await DroneModal.findById(id, {latestFirmware:1})

        if(!firm){
            return res.status(404).send({error:{message:"Modal not found"}})
        }

        const { latestFirmware } = firm

        res.send({version: latestFirmware.version, date:latestFirmware.date})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:"Something went wrong Please try again. This is an internal error"}})
    }
})

//query to paramas
router.post('/flyUp/:id', customerAuth, uploadKey, async (req, res) => {
    try{
        const { id } = req.params
        console.log(id)
        if(!id || id == "")
            return res.status(403).send({error:{message:'Provide a drone id for key upload.', id:false}})

        if(req.multerFileUploadError){
            return res.status(4015).send({error:{message:'File is not valid or too loarge.'}})
        }

        const file =req.file
        console.log(file)
        if(!req.file){
            return res.status(403).send({error:{message:'Failed to upload.'}})
        }

        const drone = await Drone.updateOne({
            _id:id, 
            assignedTo:req.customer.email
        },{
            $addToSet:{
                keyRegistry:{
                    ...file,
                    date:Date.now()
                }
            }
        })
        console.log(drone)
        if(!drone.n){
            return res.status(404).send({error:{message:"Failed to update key, drone is not linked with your mail."}})
        }
        

        res.send({message:"Your key is upadted in database."})
    } catch(e){
        console.log(e)
        res.status(500).send({error:{message:"Something went wrong Please try again."}})
    }
})

router.post('/flyDown/:id', customerAuth, uploadLog, async (req, res) => {
    try{
        const { id } = req.params
        console.log(id)
        if(!id || id == "")
            return res.status(403).send({error:{message:'Provide a drone id for key upload.', id:false}})

        if(req.multerFileUploadError){
            return res.status(4015).send({error:{message:'File is not valid or too loarge.'}})
        }

        const file =req.file
        console.log(file)
        if(!req.file){
            return res.status(403).send({error:{message:'Failed to upload.'}})
        }

        const drone = await Drone.updateOne({
            _id:id, 
            assignedTo:req.customer.email
        },{
            $addToSet:{
                logRegistry:{
                    ...file,
                    date:Date.now()
                }
            }
        })
        if(!drone.n){
            return res.status(404).send({error:{message:"Failed to update key, drone is not linked with your mail."}})
        }

        res.send({message:"Your key is upadted in database."})
    } catch(e){
        console.log(e)
        res.status(500).send({error:{message:"Something went wrong Please try again."}})
    }
})

router.get('/downloadLatestFirmware/:id', customerAuth, async (req, res) => {
    try{
        const { id } = req.params
        console.log(id)
        if(!id || id == "")
            return res.status(403).send({error:{message:'Provide a modal id for latest firmware version.', id:false}})
           
        const firm = await DroneModal.findById(id, {latestFirmware:1})

        if(!firm){
            return res.status(404).send({error:{message:"Modal not found"}})
        }

        const { latestFirmware } = firm
        console.log(latestFirmware)
        res.setHeader('Content-disposition', 'attachment; filename=' + `${latestFirmware.version}_${latestFirmware.originalName}`)
        res.setHeader('Content-type', latestFirmware.mimetype)

        res.send(latestFirmware.buffer)
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:"Something went wrong Please try again."}})
    }
})

router.get('/downloadFirmware/:id', customerAuth, async (req, res) => {
    try{
        const { id } = req.params
        const { fid } = req.body
        console.log(id, fid)
        if(!id || id == "")
            return res.status(403).send({error:{message:'Provide a modal id for latest firmware version.', id:false}})
         
        if(!fid || fid=="")
            return res.status(403).send({error:{message:'Provide a firmware id for download.', fid:false}})
        
        const firm = await DroneModal.findById(id, {_id: 0, firmwareRegistry: {"$elemMatch": {_id: fid}}})
        console.log(firm)

        if(!firm){
            return res.status(404).send({error:{message:"Drone Modal not found."}})
        }

        if(!firm.firmwareRegistry[0]){
            return res.status(404).send({error:{message:"Firmware you are serching for not found."}})
        }

        const firmware = firm.firmwareRegistry[0]
        console.log(firmware)
        res.setHeader('Content-disposition', 'attachment; filename=' + `${firmware.version}_${firmware.originalName}`)
        res.setHeader('Content-type', firmware.mimetype)

        res.send(firmware.buffer)
    } catch(e) {
        console.log(e)
        res.status(500).send({error:{message:"Something went wrong Please try again."}})
    }
})

module.exports = router