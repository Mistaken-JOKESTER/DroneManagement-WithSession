const sendMail = require('./sendMail')

const Mail = async (purpose, email, body) => {
    //checking purpose and for text and html
    let data
    if(purpose == 'Registration') {
        data = Registration(body)
    }
    else if(purpose == 'Login') {
        data = Login(body)
    }
    else if(purpose == 'PasswordChange') {
        data = changePasswordOtp(body)
    }
    else if(purpose == 'PasswordChanged') {
        data = passwordchanged(body)
    } 
    else if(purpose == 'AccountDeleteRequest') {
        data = accountDeleteRequest(body)
    } 
    else if(purpose == 'AccountDeleted') {
        data = accountDeleted(body)
    } 

    //sending mail
    await sendMail(email, data.subject, data.html)
}

//Mail templet for regestration
const Registration = ({ name }) => {
    return { 
        subject:'Regestration at DronePoint',
        //text:`Hello ${name}Thank you for regestring at Drone Point, Once our developers verify you than you can your account.Have a nice day. :-)`,
        html:`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DronePoint</title>
                <style>
                    body{
                        font-family: sans-serif;
                    }
                    .otp{
                        color:rgb(37, 37, 37);
                    }
                </style>
            </head>
            <body style="background-color:rgb(104, 218, 253);text-align: center; ">
                <br>
                <h1>Drone-Point</h1>
                <br>
                <h2>Hello ${name}</h2>
                <p>Thank you for regestring at <h3>Drone Point</h3>, Once our developers verify you than you can your account.
                Have a nice day. :-)</p>
                <br>
            </body>
            </html>`
    }
}

//mail templet for login Otp(varification code)
const Login = ({ name, otp }) => {
    return { 
        subject:'Otp for Login at DronePoint',
        //text:`Hello ${name}Your otp for loging in into drone point is ${otp}.If its not you than someone else just tried to loged into your account.We Preffer you to change password or call support team if its not you.`,
        html:`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DronePoint</title>
                <style>
                    body{
                        font-family: sans-serif;
                    }
                    .otp{
                        color:rgb(37, 37, 37);
                    }
                </style>
            </head>
            <body style="background-color:rgb(104, 218, 253);text-align: center; ">
                <br>
                <h1>Drone-Point</h1>
                <br>
                <h2>Hello ${name}</h2>
                <p> Your otp for loging in into drone point is</p>
                <h2 class="otp">${otp}</h2> 
                <br>
                <hr>
                <p> If its not you than someone else just tried to loged into your account.
                    We Preffer you to change password or call support team if its not you.</p>
                <br>
            </body>
            </html>`
    }
}

//mail templet for password change request
const changePasswordOtp = ({ name, otp }) =>{
    return { 
        subject:'Otp for password chnage at DronePoint',
        //text:`Hello ${name}Your otp to change pasword at drone point is ${otp}.If its not you than someone else just tried to change.We Preffer you to call support team if its not you.`,
        html:`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>DronePoint</title>
                    <style>
                        body{
                            font-family: sans-serif;
                        }
                        .otp{
                            color:rgb(37, 37, 37);
                        }
                    </style>
                </head>
                <body style="background-color:rgb(104, 218, 253);text-align: center; ">
                    <br>
                    <h1>Drone-Point</h1>
                    <br>
                    <h2>Hello ${name}</h2>
                    <p> Your otp to change password at drone point is</p>
                    <h2 class="otp">${otp}</h2> 
                    <br>
                    <hr>
                    <p> If its not you than someone else just tried to loged into your account.
                        We Preffer you to call support team if its not you.</p>
                    <br>
                </body>
                </html>`
    }
}

//mail templet for password changed
const passwordchanged = ({ name }) => {
    return { 
        subject:'Password changed succesfully',
        //text:`Hello ${name}Your password has been changed successfully.Have a nice day. :-)`,
        html:`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DronePoint</title>
                <style>
                    body{
                        font-family: sans-serif;
                    }
                    .otp{
                        color:rgb(37, 37, 37);
                    }
                </style>
            </head>
            <body style="background-color:rgb(104, 218, 253);text-align: center; ">
                <br>
                <h1>Drone-Point</h1>
                <br>
                <h2>Hello ${name}</h2>
                <p>Your password is changed successfully.
                Have a nice day. :-)</p>
                <br>
            </body>
            </html>`
    }
}

const accountDeleteRequest = ({ otp }) => {
    return { 
        subject:'Delete account request',
        //text:`Hello ${name}Your password has been changed successfully.Have a nice day. :-)`,
        html:`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DronePoint</title>
                <style>
                    body{
                        font-family: sans-serif;
                    }
                    .otp{
                        color:rgb(37, 37, 37);
                    }
                </style>
            </head>
            <body style="background-color:rgb(104, 218, 253);text-align: center; ">
                <br>
                <h1>Drone-Point</h1>
                <br>
                <h2>Otp for delete account request is ${otp}</h2>
                <p>If its not you we recommend to change your password
                Have a nice day. :-)</p>
                <br>
            </body>
            </html>`
    }
}

const accountDeleted = ({ name }) => {
    return { 
        subject:'Account deleted succesfully',
        //text:`Hello ${name}Your password has been changed successfully.Have a nice day. :-)`,
        html:`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DronePoint</title>
                <style>
                    body{
                        font-family: sans-serif;
                    }
                    .otp{
                        color:rgb(37, 37, 37);
                    }
                </style>
            </head>
            <body style="background-color:rgb(104, 218, 253);text-align: center; ">
                <br>
                <h1>Drone-Point</h1>
                <br>
                <h2>Hello ${name}</h2>
                <p>Your account is deleted succesfully.
                Have a nice day. :-)</p>
                <br>
            </body>
            </html>`
    }
}

module.exports = Mail