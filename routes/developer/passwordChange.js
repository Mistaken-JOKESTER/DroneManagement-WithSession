const express = require('express')
const validator = require('validator')
const router = express.Router()
const Developer = require('../../modals/Developer')
const { redirectDahboard, redirectHome, otpredirect } = require('../../middleware/developer/developerAuth')

router.get('/forgotPassword', redirectDahboard, (req, res) => {
    try{
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        res.render('pages/passwordChange/forgotpassword',{
            success_msg,
            error_msg,
            warning_msg
        })
    } catch (e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.post('/forgotPassword', redirectDahboard, async (req, res) => {
    try{
        const { email } = req.body
        if(!email || email.length == 0){
            return res.render('pages/passwordChange/forgotpassword', {error_msg:'Please provide a valid email', email})
        }
        const developer = await Developer.findOne({email})
        if(!developer){
            return res.render('pages/passwordChange/forgotpassword', {error_msg:'Please provide a valid email', email})
        }

        await developer.sendPassChangeOtp()
        req.session.loginId = process.env.LOGIN_ID_SECRETE.toString()+ '#' + developer._id + '#' + Date.now()
        req.session.pchangeTime = Date.now()
        res.redirect('verifyOtp')
    } catch (e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/changePassword', redirectHome, async (req, res) => {
    try{
        const developer = await Developer.findById(req.session.userId)
        req.session.userId = null
        if(!developer){
            req.flash('error_msg', 'Something went wrong login again')
            return res.redirect('/developer/home/login')
        }

        await developer.sendPassChangeOtp()
        req.session.loginId = process.env.LOGIN_ID_SECRETE.toString()+ '#' + developer._id + '#' + Date.now()
        req.session.pchangeTime = Date.now()
        res.redirect('verifyOtp')
    } catch (e) {
        console.log(e)
        res.render('pages/505Error')
    }
})


router.get('/verifyOtp', otpredirect, async (req,res) => {
    try{
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        res.render('pages/passwordChange/otp',{
            error_msg,
            success_msg,
            warning_msg
        })
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/regnerateOtp', otpredirect, async(req, res)=>{
    try{
        //checking if user regenerating agian and again
        const time = Date.now() - req.session.pchangeTime
        if(time > 300000){
            //regenrating session
            req.session.loginId = undefined
            req.flash('error_msg', 'You took to long to submit otp login again.')
            res.redirect('/developer/home/login')
        } else {
            //fetching user
            const id = req.session.loginId.toString().split("#");
            const developer = await Developer.findById(id[1])
            if(!developer)
                return res.render('pages/passwordChange/otp',{
                    error_msg:"You are missing form database contact our support team.",
                    otp:req.body.otp
                })
            
            await developer.sendPassChangeOtp()
            req.flash('success_msg', 'Enter the new otp sent to your mail.')
            res.redirect('/developer/password/verifyOtp')
        }
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.post('/verifyOtp', otpredirect, async (req, res) =>{
    try{
        const otp = req.body.otp
        if(!otp || otp == 000000)
            return res.render('pages/passwordChange/otp',{
                error_msg:"Please provide Otp"
            })
            
        const id = req.session.loginId.toString().split("#");
        const developer = await Developer.findById(id[1])
        if(!developer)
            return res.render('pages/passwordChange/otp',{
                error_msg:"You are missing form database contact our support team.",
                otp:req.body.otp
            })
        
        const {valid, error_msg} = developer.verifyPassChangeOtp(req.body.otp)
        if(!valid)
            return res.render('pages/passwordChange/otp',{
                error_msg,
                otp:req.body.otp
            })
        
        req.session.logedIn = false
        res.redirect('/developer/password/newPassword')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.get('/newPassword', otpredirect, (req, res) =>{
    try{
        res.render('pages/passwordChange/newPassword')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.post('/newPassword', otpredirect, async (req, res) => {
    try{
        const errors = []
        const { password, confPassword } = req.body
        if(!password || !confPassword){
            errors.push('Please provide all feilds')
        }
        //validating password
        if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[A-Z]).{8,}/.test(password) || validator.isEmpty(password)){
            errors.push('Password must contain atleast 8 characters, One small, one capital alphabet and one number.')
        }
        if(password !== confPassword){
            errors.push('Password is not matching with confirm password')
        }

        if(errors.length){
            return res.render('pages/passwordChange/newPassword', {errors, password, confPassword})
        }

        const id = req.session.loginId.toString().split("#");
        const developer = await Developer.findById(id[1])
        if(!developer){
            req.session.loginId = null
            req.flash('error_msg', 'Something went wrong try agian')
            return res.redirect('/developer/home/login')
        }

        developer.password = password
        await developer.save()
        req.session.loginId = null
        req.flash('success_msg', 'Your password is changed, Please login again.')
        res.redirect('/developer/home/login')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})

router.get('/cancle', (req, res)=>{
    try{
        req.session.loginId = null
        req.flash('warning_msg', 'Password change request cancled.')
        res.redirect('/developer/home/login')
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
})


module.exports = router