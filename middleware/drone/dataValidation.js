const validator = require('validator')
const DroneModal = require('../../modals/DroneModal')
const Customer = require('../../modals/Customer')
const Drone = require('../../modals/Drone')
const sanitize = require('../htmlSanitizer/sanitizer')

async function droneDataValidation (req, res, next){
    try{
        let errors = []
        let modal
        let { modalId, flightControllerNumber, buildDate, assignedTo } = req.body

        modalId = sanitize(modalId)
        flightControllerNumber = sanitize(flightControllerNumber)
        assignedTo = sanitize(assignedTo)

        if(!modalId || validator.isEmpty(modalId)){
            errors.push('Select a valid modal.')
        } else {
            modal = await DroneModal.findById(modalId, {_id:1, modalName:1, inAir:1})
            if(!modal){
                errors.push('Modal you selected doesnot exesit, select a different modal.')
            } 
        }

        if(!flightControllerNumber || validator.isEmpty(flightControllerNumber) || !validator.isAlphanumeric(flightControllerNumber)){
            errors.push('Flight controller number Invalid.')
        } else {
            const dorneExesist = await Drone.findOne({flightControllerNumber}, {_id:1})
            if(dorneExesist)
                errors.push('Drone with given flight controller number already exesist')
        }

        if(!buildDate || !validator.isDate(buildDate)){
            errors.push('Date is not valid.')
        }

        if(!assignedTo || !validator.isEmail(assignedTo)){
            errors.push('Customer e-mail is not valid')
        } else {
            const customer = await Customer.findOne({email: assignedTo},{_id:1, verificationStatus:1})
            if(!customer){
                errors.push('There is no customer with this e-mail.')
            } else if(!customer.verificationStatus){
                errors.push('Customer account is not verified.')
            }
        }

        if(errors.length)
            req.body = {valid:false, errors}
        else 
            req.body = {valid:true}

        req.body.data = {
            modalId:modal._id,
            assignedTo,
            flightControllerNumber,
            modalName:modal.modalName,
            buildDate,
            droneNo:parseInt(modal.inAir) + 1
        }
        next()
    } catch(e) {
        console.log(e)
        return res.status(500).render('pages/505Error')
    }
}

module.exports = droneDataValidation