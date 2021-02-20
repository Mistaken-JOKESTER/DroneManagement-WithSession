const mongoose = require('mongoose')
const generateOtp = require('../middleware/otpGenerate/otpGenerate')
const bcrypt = require('bcryptjs')
const Mail = require('../middleware/sendMail/emailTemplets')

//schema for developer
const developerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    mobile:{
        type:Number,
        required:true,
        trim:true,
        maxlength:10,
        minlength:10
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    verificationStatus:{
        type: Boolean,
        require:true,
        default:false
    },
    loginStatus:{
        otp:{
            time:{
                type:Date
            },
            value:{
                type:Number,
                minlength:5,
                maxlength:5,
                default: 00000
            }
        }
    },
    passwordChangeStatus:{
        otp:{
            time:{
                type:Date
            },
            value:{
                type:Number,
                minlength:5,
                maxlength:5
            }
        }
    },
    accountDelete:{
        otp:{
            time:{
                type:Date
            },
            value:{
                type:Number,
                minlength:5,
                maxlength:5
            }
        }
    }
})

developerSchema.pre('save', async function (next) {
    const developer = this
    //hasing password whenever modigied
    if(developer.isModified('password')) {
        developer.password = await bcrypt.hash(developer.password, 8)
    }
    next()
})

//checking password on login
developerSchema.statics.findByCredentials = async (email, password) => {
    //checking if password exesist
    const developer = await Developer.findOne({email})
    if(!developer)
        return {error:'You are not registered', developer: null}

    //comparing password
    const isMatch = await bcrypt.compare(password, developer.password)
    if(!isMatch || !developer.verificationStatus)
        return {error:'You are not verified or password is wrong', developer:null}

    return {developer, error:null}
}

//send otp when logged in
developerSchema.methods.sendLoginOtp = async function () {

    //generating Otp
    otp = await generateOtp()

    //saving otp and time to database
    this.loginStatus = {otp:{time:Date.now(), value:otp}}
    await this.save()

    //sending otp in mail
    //await Mail('Login', this.email, {name:this.name, otp})
    return 
}

developerSchema.methods.verifyLoginOtp = function (otp){
    //checking time of otp
    const timeLasped = Date.now() - this.loginStatus.otp.time
    if(timeLasped > 120000)
        return {valid:false, error_msg:'Otp timed out.'}
    //checking value of otp
    if(this.loginStatus.otp.value != otp)
        return {valid:false, error_msg:'Otp is Invalid'}

    return {valid:true, error_msg:null}
}

developerSchema.methods.sendPassChangeOtp = async function (){
    const otp = await generateOtp()

    //saving otp and time to database
    this.passwordChangeStatus = {otp:{time:Date.now(), value:otp}}
    await this.save()

    //sending otp in mail
    //await Mail('PasswordChange', this.email, {name:this.name, otp})
    return 
}

developerSchema.methods.verifyPassChangeOtp = function (otp){
    //checking time of otp
    const timeLasped = Date.now() - this.passwordChangeStatus.otp.time
    if(timeLasped > 120000)
        return {valid:false, error_msg:'Otp timed out.'}
    //checking value of otp
    if(this.passwordChangeStatus.otp.value != otp)
        return {valid:false, error_msg:'Otp is Invalid'}

    return {valid:true, error_msg:null}
}

//send otp when logged in
developerSchema.methods.sendDeleteAccountOtp = async function () {

    //generating Otp
    otp = await generateOtp()

    //saving otp and time to database
    this.accountDelete = {otp:{time:Date.now(), value:otp}}
    await this.save()

    //sending otp in mail
    //await Mail('AccountDeleteRequest', this.email, {name:this.name, otp})
    return 
}

developerSchema.methods.verifyDeleteAccountOtp = function (otp){
    //checking time of otp
    const timeLasped = Date.now() - this.accountDelete.otp.time
    if(timeLasped > 120000)
        return {valid:false, error_msg:'Otp timed out.'}
    //checking value of otp
    if(this.accountDelete.otp.value != otp)
        return {valid:false, error_msg:'Otp is Invalid'}

    //sending mail
    //await Mail('AccountDeleted', this.email, {name:this.name, otp})
    return {valid:true, error_msg:null}
}

const Developer = mongoose.model('Developer', developerSchema)

module.exports = Developer