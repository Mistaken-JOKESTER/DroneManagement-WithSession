const nodeMailer = require('nodemailer')

//send email using nodemailer
async function sendMail(email, subject, html) {
    
    //service and our email for sending mail
    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'drone7160@gmail.com',
        pass: 'Drone_test@1'
      }
    })
    
    //mail to be sent.
    const mailOptions = {
      from: 'drone7160@gmail.com',
      to: `${email}`,
      subject: `${subject}`,
      html
    }
    
    //response if mail is sent or not
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    })
}
  
module.exports = sendMail