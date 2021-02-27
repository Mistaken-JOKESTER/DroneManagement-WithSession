const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const otpGenerate = require('../middleware/otpGenerate/otpGenerate')
const Mail = require('../middleware/sendMail/emailTemplets')

const pilotSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    mobile:{
        type:Number,
        minlength:10,
        maxlength:10
    },
    email:{
        type:String,
        lowercase:true,
        trim:true,
        required:true
    },
    verificationStatus:{
        type:Boolean,
        default:true
    },
    cerificate:{
        type:Buffer,
        required:true
    },
    password:{
        type:String
    },
    loginStatus:{
        loginToken:{
            type:String,
            default:''
        },
        otp:{
            time:{
                type:Date,
                default:30000000
            },
            value:{
                type:Number,
                minlength:5,
                maxlength:5,
                default: 00000
            },
            regenerate:{
                type:Number,
                default:0
            }
        }
    },
    passwordStatus:{
        passwordToken:{
            type:String,
            default:''
        },
        otp:{
            time:{
                type:Date,
                default:30000000
            },
            value:{
                type:Number,
                minlength:5,
                maxlength:5
            },
            regenerate:{
                type:Number,
                default:0

            }
        }
    },
    deleteStatus:{
        status:{
            type:Boolean,
            default:false
        },
        otp:{
            time:{
                type:Date,
                default:30000000
            },
            value:{
                type:Number,
                minlength:5,
                maxlength:5
            },
            regenerate:{
                type:Number,
                default:0
            }
        }
    },
    accessTokens:[String]
})

pilotSchema.statics.findByCredentials = async function(email, password){
    const pilot = await Pilot.findOne({email})
    if(!pilot)
        return false

    const comapre = await bcrypt.compareSync(password, pilot.password)
    if(!comapre)
        return false

    if(!pilot.verificationStatus)
        return false

    return pilot
}

pilotSchema.methods.generateAndSendOtp = async function(regenerate){
    let loginToken
    const pilot = this
    const otp = await otpGenerate()
    if(!regenerate){
        loginToken = await jwt.sign({id: pilot._id}, process.env.LOGIN_TOKEN_SECRETE.toString(), {
            algorithm: "HS256",
            expiresIn: 300000
        })
        pilot.loginStatus.loginToken = loginToken
        pilot.loginStatus.otp.regenerate=0
    }
    pilot.loginStatus.otp.value = otp
    pilot.loginStatus.otp.time = Date.now()
    pilot.loginStatus.otp.regenerate++
    
    await Mail('Login', pilot.email, {otp, name:pilot.name})
    await pilot.save()
    return loginToken
}

pilotSchema.methods.resetLoginStatus = async function(){
    const pilot = this
    pilot['loginStatus'] = {
        loginToken:'',
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }
    await pilot.save()
}

pilotSchema.methods.permanentToken = async function(){
    let pilot = this
    const accessToken = jwt.sign({id: pilot._id}, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "5h"
    })

    pilot.loginStatus = {
        loginToken:'',
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }

    pilot.accessTokens.push(accessToken.toString())
    await pilot.save()
    return accessToken
}

pilotSchema.methods.passwordChangeRequest = async function (regenerate){
    let passwordToken
    const pilot = this
    const otp = await otpGenerate()
    if(!regenerate){
        passwordToken = await jwt.sign({id: pilot._id}, process.env.LOGIN_TOKEN_SECRETE.toString(), {
            algorithm: "HS256",
            expiresIn: 300000
        })
        pilot.passwordStatus.passwordToken = passwordToken
        pilot.passwordStatus.otp.regenerate=0
    }
    pilot.passwordStatus.otp.value = otp
    pilot.passwordStatus.otp.time = Date.now()
    pilot.passwordStatus.otp.regenerate++
    Mail('PasswordChange', pilot.email, {otp, name:pilot.name})
    await pilot.save()
    return passwordToken
}

pilotSchema.methods.resetPasswordStatus = async function(){
    let pilot = this
    pilot.passwordStatus = {
        passwordToken:'',
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }
    pilot.accessToken = []
    await pilot.save()
}

pilotSchema.methods.resetPassword = async function (newPassword) {
    let pilot = this
    pilot.password = newPassword
    pilot.passwordStatus = {
        passwordToken:'',
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }
    pilot.accessTokens = []
    await pilot.save()
    Mail('PasswordChanged', pilot.email, {name:pilot.name})
    return
}

pilotSchema.methods.deleteAccountRequest = async function(regenerate){
    let pilot = this
    const otp = await otpGenerate()
    if(!regenerate){
        pilot.deleteStatus.status = true
        pilot.deleteStatus.otp.regenerate=0
    }
    pilot.deleteStatus.otp.value = otp
    pilot.deleteStatus.otp.time = Date.now()
    pilot.deleteStatus.otp.regenerate++
    Mail('AccountDeleteRequest', pilot.email, {otp, name:pilot.name})
    await pilot.save()
    return
}

pilotSchema.methods.resetDeleteStatus = async function(){
    let pilot = this
    pilot.deleteStatus = {
        status:false,
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }
    pilot.accessToken = []
    await pilot.save()
}

pilotSchema.pre('save', async function (next) {
    const pilot = this

    if(pilot.isModified('password')) {
        pilot.password = await bcrypt.hash(pilot.password, 8)
    }

    next()
})


const Pilot = mongoose.model('Pilot', pilotSchema)

module.exports = Pilot