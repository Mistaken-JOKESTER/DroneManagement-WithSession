const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Developer = require('./Developer')
const otpGenerate = require('../middleware/otpGenerate/otpGenerate')
const Mail = require('../middleware/sendMail/emailTemplets')

const customerSchema = new mongoose.Schema({
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
        default:false
    },
    // position:{
    //     type:String,
    //     trim:true,
    //     enum:['Pilot', 'Customer'],
    // },
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

customerSchema.statics.findByCredentials = async function(email, password){
    const customer = await Customer.findOne({email})
    if(!customer)
        return false

    const comapre = await bcrypt.compareSync(password, customer.password)
    if(!comapre)
        return false

    if(!customer.verificationStatus)
        return false

    return customer
}

customerSchema.methods.generateAndSendOtp = async function(regenerate){
    let loginToken
    const customer = this
    const otp = await otpGenerate()
    if(!regenerate){
        loginToken = await jwt.sign({id: customer._id}, process.env.LOGIN_TOKEN_SECRETE.toString(), {
            algorithm: "HS256",
            expiresIn: 300000
        })
        customer.loginStatus.loginToken = loginToken
        customer.loginStatus.otp.regenerate=0
    }
    customer.loginStatus.otp.value = otp
    customer.loginStatus.otp.time = Date.now()
    customer.loginStatus.otp.regenerate++
    
    await Mail('Login', customer.email, {otp, name:customer.name})
    await customer.save()
    return loginToken
}

customerSchema.methods.resetLoginStatus = async function(){
    const customer = this
    customer['loginStatus'] = {
        loginToken:'',
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }
    await customer.save()
}

customerSchema.methods.permanentToken = async function(){
    let customer = this
    const accessToken = jwt.sign({id: customer._id}, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "5h"
    })

    customer.loginStatus = {
        loginToken:'',
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }

    customer.accessTokens.push(accessToken.toString())
    await customer.save()
    return accessToken
}

customerSchema.methods.passwordChangeRequest = async function (regenerate){
    let passwordToken
    const customer = this
    const otp = await otpGenerate()
    if(!regenerate){
        passwordToken = await jwt.sign({id: customer._id}, process.env.LOGIN_TOKEN_SECRETE.toString(), {
            algorithm: "HS256",
            expiresIn: 300000
        })
        customer.passwordStatus.passwordToken = passwordToken
        customer.passwordStatus.otp.regenerate=0
    }
    customer.passwordStatus.otp.value = otp
    customer.passwordStatus.otp.time = Date.now()
    customer.passwordStatus.otp.regenerate++
    Mail('PasswordChange', customer.email, {otp, name:customer.name})
    await customer.save()
    return passwordToken
}

customerSchema.methods.resetPasswordStatus = async function(){
    let customer = this
    customer.passwordStatus = {
        passwordToken:'',
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }
    customer.accessToken = []
    await customer.save()
}

customerSchema.methods.resetPassword = async function (newPassword) {
    let customer = this
    customer.password = newPassword
    customer.passwordStatus = {
        passwordToken:'',
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }
    customer.accessTokens = []
    await customer.save()
    Mail('PasswordChanged', customer.email, {name:customer.name})
    return
}

customerSchema.methods.deleteAccountRequest = async function(regenerate){
    let customer = this
    const otp = await otpGenerate()
    if(!regenerate){
        customer.deleteStatus.status = true
        customer.deleteStatus.otp.regenerate=0
    }
    customer.deleteStatus.otp.value = otp
    customer.deleteStatus.otp.time = Date.now()
    customer.deleteStatus.otp.regenerate++
    Mail('AccountDeleteRequest', customer.email, {otp, name:customer.name})
    await customer.save()
    return
}

customerSchema.methods.resetDeleteStatus = async function(){
    let customer = this
    customer.deleteStatus = {
        status:false,
        otp:{
            time:30000000,
            value:00000,
            regenerate: 0
        }
    }
    customer.accessToken = []
    await customer.save()
}

customerSchema.pre('save', async function (next) {
    const customer = this

    if(customer.isModified('password')) {
        customer.password = await bcrypt.hash(customer.password, 8)
    }

    next()
})


const Customer = mongoose.model('Customer', customerSchema)

module.exports = Customer