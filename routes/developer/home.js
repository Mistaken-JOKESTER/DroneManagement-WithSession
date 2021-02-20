//all developer related routes
const express = require('express')
const router= express.Router()

const Mail = require('../../middleware/sendMail/emailTemplets')
const developerDataValidation = require('../../middleware/developer/developerDataValidation')
const { redirectDahboard, redirectHome, otpredirect } = require('../../middleware/developer/developerAuth')

const Developer = require('../../modals/Developer')

//login/register route
router.get('/', (req, res) => {
    try{
        if(!req.session.userId){
            req.session.logedIn = false
        }
        res.render('pages/Home',{logedIn:req.session.logedIn})
    } catch (e) {
        console.log(e)
        res.status(500).render('pages/505Error')
    }
})

//route for registration page
router.get('/Register', redirectDahboard, (req, res) =>{
    try{
        res.render('pages/register/Dregister')
    } catch (e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

//route for register request
router.post('/Register', redirectDahboard, developerDataValidation, async(req, res) =>{
    try{
        //checking if any errors
        if(req.validationErrors){
            return res.render('pages/register/Dregister', {
                errors:req.validationErrors, 
                data:req.developerData,
                error_msg: 'Registration Failed'
            })
        }

        //saving data to database
        const developer = new Developer(req.developerData)
        await developer.save()

        //sending regestration mail and redirecting to login
        //await Mail('Registration', developer.email, {name:developer.name})
        req.flash('success_msg', 'You are registered Successfully')
        res.redirect('Login')
    } catch (e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

//login page
router.get('/Login', redirectDahboard, (req,res) =>{
    try{
        //cheching ig any message present form previous redirect
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        res.render('pages/login/login', {
            success_msg,
            error_msg,
            warning_msg
        })
    } catch (e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

//login request
router.post('/Login', redirectDahboard, async (req,res) => {
    try{
        //fetching email and password
        const {email, password} = req.body
        if(!email || !password){
            return res.render('pages/login/login',{
                email,
                password,
                error_msg:'Please fill all feilds'
            })
        }

        //checking if developer is present in database and comparing password
        const {error, developer} = await Developer.findByCredentials(email, password)
        if(error){
            return res.render('pages/login/login',{
                email,
                password,
                error_msg:error
            })
        }

        //sending otp and storing its value in database
        await developer.sendLoginOtp()
        req.session.loginId = process.env.LOGIN_ID_SECRETE.toString()+ '#' + developer._id + '#' + Date.now()
        req.session.loginTime = Date.now()
        res.redirect('loginotp')

    } catch(e) {
        console.log(e)
        res.status(500).render('pages/505Error')
    }
})

//otp page
router.get('/loginotp', otpredirect, async (req, res) => {
    try{
        //cheching ig any message present form previous redirect
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        //page for submiting otp
        res.render('pages/login/otp')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

//verify otp request
router.post('/verifyloginotp', otpredirect, async (req, res) => {
    try{
        //fetching otp and cheking if empty
        const otp = req.body.otp
        if(!otp || otp == 000000)
            return res.render('pages/login/otp',{
                error_msg:"Please provide Otp"
            })
        
        //extracing id form session and fetching user
        const id = req.session.loginId.toString().split("#");
        const developer = await Developer.findById(id[1])
        if(!developer)
            return res.render('pages/login/otp',{
                error_msg:"You are missing form database contact our support team.",
                otp:req.body.otp
            })
        
        //checking if otp is valid
        const {valid, error_msg} = developer.verifyLoginOtp(req.body.otp)
        if(!valid)
            return res.render('pages/login/otp',{
                error_msg,
                otp:req.body.otp
            })
        
        //redirecting user to dashboard with user id session stored
        req.session.loginId = undefined
        req.session.userId = developer._id
        req.session.logedIn = true
        res.redirect('dashboard')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

//regenerate otp request
router.get('/regenerateotp', otpredirect, async (req, res) => {
    try{
        //checking if user regenerating agian and again
        const time = Date.now() - req.session.loginTime
        if(time > 300000){
            //regenrating session
            req.session.loginId = undefined
            req.flash('error_msg', 'You took to long to submit otp login again.')
            res.redirect('login')
        } else {
            //fetching user id and user
            const id = req.session.loginId.toString().split("#");
            const developer = await Developer.findById(id[1])
            //checking if user exesist
            if(!developer)
                return res.render('pages/login/otp',{
                    error_msg:"You are missing form database contact our support team.",
                    otp:req.body.otp
                })
            
            //sending otp
            await developer.sendLoginOtp()
            res.redirect('loginotp')
        }
        
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

//dashboard page
router.get('/dashboard', redirectHome, (req, res) => {
    try{
        //checking if any errors form previous request
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        res.render('pages/dashboard/dashboard', {
            success_msg,
            error_msg,
            warning_msg
        })
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

//logout request
router.get('/logout', redirectHome, async (req, res) =>{
    try{
        //undefining userId form session
        req.session.userId = null
        req.session.logedIn = false
        req.flash('success_msg', 'You are loged out successfully.')
        res.redirect('login')
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})


//otp page for delete account
router.get('/deleteAccount', redirectHome, async (req, res) => {
    try{
        //fetching user
        //checking if exesist
        //sending otp for verification
        if(!req.session.deleteOtpTime || req.session.regenerate){
            const developer = await Developer.findById(req.session.userId)
            if(!developer){
                req.flash('warning_msg', 'Something is worng refresh and try agian.')
                res.redirect('login')
            }
            await developer.sendDeleteAccountOtp()
            req.session.regenerate = false
            if(!req.session.deleteOtpTime)
                req.session.deleteOtpTime = Date.now()
        }

        //cheching if any message present form previous redirect
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        //page for submiting otp
        res.render('pages/dashboard/deleteAccount', {
            success_msg,
            error_msg,
            warning_msg
        })
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

//verify otp request
router.post('/deleteAccount', redirectHome, async (req, res) => {
    try{
        //fetchning otp and checking if emtpy
        const otp = req.body.otp
        if(!otp || otp == '000000'){
            req.flash('warning_msg', 'Please provide otp')
            return res.redirect('deleteAccount')
        }  
        
        //fetching user and cheking if user exesist
        const id = req.session.userId
        const developer = await Developer.findById(id)
        if(!developer){
            req.flash('error_msg', 'Something went wrong')
            return res.redirect('dashboard')
        }
        
        //varifying otp
        const {valid, error_msg} = developer.verifyDeleteAccountOtp(otp)
        if(!valid){
            req.flash('error_msg', error_msg.toString())
            return res.redirect('deleteAccount')
        }
        
        //deleting account and checking if account deleted
        const deletedAccount = await Developer.findByIdAndDelete(req.session.userId)
        //reseting session variables
        req.session.userId = undefined
        req.session.deleteOtpTime = undefined
        req.session.regenerate = undefined
        if(!deletedAccount){
            req.flash('error_msg', 'Something went wrong try again Please try agian')
            return res.redirect('login')
        }

        //susccess redirecting to login page
        req.flash('success_msg', 'Your account is deleted successfully')
        res.redirect('login')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

//regenerate otp request for delete account
router.get('/regenerateDeleteAccountOtp', redirectHome, async (req, res) => {
    try{
        //checking if user regenerating agian and again
        const time = Date.now() - req.session.deleteOtpTime
        if(time > 300000){
            //time over
            req.session.deleteOtpTime = undefined
            req.session.regenerate = undefined
            req.flash('error_msg', 'You took to long to submit otp.')
            res.redirect('dashboard')
        } else {
            //regerating otp
            req.session.regenerate = true
            req.flash('success_msg', 'Enter the new otp sent to your mail')
            res.redirect('deleteAccount')
        }
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

//cancle delete account request
router.get('/cancledeleteAccount', redirectHome, async (req, res) => {
    try{
        //resesting time of otp of user
        const developer = await Developer.updateOne({_id:req.session.userId}, {accountDelete:{otp:{time:300000}}})
        console.log(developer)
        if(!developer.nModified){
            req.flash('error_msg', 'Something went wrong.')
            return res.redirect('dashboard')
        }

        //reseting some variable form session
        req.session.deleteOtpTime = undefined
        req.session.regenerate = undefined
        req.flash('success_msg', 'Delete account request cancled.')
        res.redirect('dashboard')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

module.exports = router