const Developer = require('../../modals/Developer')
const Customer = require('../../modals/Customer')

const { redirectHome } = require('../../middleware/developer/developerAuth')
const Mail = require('../../middleware/sendMail/emailTemplets')
const customerDatavalidation = require('../../middleware/customer/customerDataValidation')

const router = require('express').Router()

router.get('/', redirectHome, async (req, res) => {
    try{
        const customers = await Customer.find({verificationStatus:false})
        const developers = await Developer.find({verificationStatus:false})

        //cheching ig any message present form previous redirect
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        res.render('pages/verifyAndCustomerRegister/verifyandRegister', {
            developers,
            customers,
            success_msg,
            error_msg,
            warning_msg
        })
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/registercustomer', redirectHome, (req, res) => {
    try{
        const success_msg = req.flash('success_msg')[0]
        const error_msg = req.flash('error_msg')[0]
        const warning_msg = req.flash('warning_msg')[0]
        res.render('pages/verifyAndCustomerRegister/customerRegisteration', {
            success_msg,
            error_msg,
            warning_msg
        })
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.post('/registerCustomer', redirectHome, customerDatavalidation, async (req,res) => {
    try{
        //checking if any errors
        if(req.validationErrors){
            return res.render('pages/verifyAndCustomerRegister/customerRegisteration', {
                errors:req.validationErrors, 
                data:req.customerData,
                error_msg: 'Registration Failed'
            })
        }

        //saving data to database
        const customer = new Customer(req.customerData)
        await customer.save()

        //sending regestration mail and redirecting to login
        //await Mail('Registration', customer.email, {name:customer.name})
        req.flash('success_msg', 'Customer is registered Successfully')
        res.redirect('registerCustomer')
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/verifycustomer/:id', redirectHome, async (req, res) => {
    try{
        const id = req.params.id
        if(!id){
            return res.send({success:false})
        }

        const customer = await Customer.updateOne({_id:id}, {verificationStatus:true})
        if(!customer.nModified){
            return res.send({success:false})
        }

        res.send({success:true})
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

router.get('/verifydeveloper/:id', redirectHome, async (req, res) => {
    try{
        const id = req.params.id
        if(!id){
            return res.send({success:false})
        }

        const developer = await Developer.updateOne({_id:id}, {verificationStatus:true})
        if(!developer.nModified){
            return res.send({success:false})
        }
        res.send({success:true})
    } catch(e) {
        console.log(e)
        res.render('pages/505Error')
    }
})

module.exports = router