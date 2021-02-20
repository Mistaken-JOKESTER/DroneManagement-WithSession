const sanitize = require('../htmlSanitizer/sanitizer')
const validator = require('validator')
const TEMPDroneModal = require('../../modals/TemporaryModalContainer')
const DroneModal = require('../../modals/DroneModal')

async function developerDatavalidation(req, res, next){
    try{    
            // collecting error to change feild colors 
            //red - invlid data
            //green - valid data
            const dataErrors = {}
            let sanitizeError = false

            //show particular errors if any
            const errors = []

            //data types for data vlaidation
            const numbericType = [ 'maxTakeOffWeight', 'maxHeightAttainable', 'compatiblePayload', 'enginePower', 'engineCount', 'fuelCapacity', 'maxEndurance', 'maxRange', 'maxSpeed', 'length','breadth','height']
            const alphanumericType = ['modalName', 'modalNumber']
            const alphaType = ['wingType', 'droneCategoryType', 'engineType', 'propellerDetails']

            //exrating data from req.body
            //We are not directly using req.body beacuse a person can 
            //send extra feild which are required by us
            let data = (({ modalName, modalNumber, wingType, maxTakeOffWeight, maxHeightAttainable, compatiblePayload, droneCategoryType, purposeOfOperation, engineType, enginePower, engineCount, fuelCapacity, propellerDetails, maxEndurance, maxRange, maxSpeed, length,breadth,height}) => ({
                           modalName, modalNumber, wingType, maxTakeOffWeight, maxHeightAttainable, compatiblePayload, droneCategoryType, purposeOfOperation, engineType, enginePower, engineCount, fuelCapacity, propellerDetails, maxEndurance, maxRange, maxSpeed, length,breadth,height
            }))(req.body)

            //chechking if any feild is empty or get empty after saniting data
            for (let [key, value] of Object.entries(data)) {
                data[key]= sanitize(value)
                if(!data[key] || data[key].toString().length == 0){
                    dataErrors[`${key}`] = 1
                    sanitizeError = true
                } else {
                    dataErrors[`${key}`] = 0
                }
            }
            if(sanitizeError){
                errors.push('Information in all red feilds are invalid or empty.')
            }

            //cheking if given modal already exesist
            const modalNameExesit = await DroneModal.find({modalName:data.modalName}, {_id:1,modalName:1})
            const modalNumberExesist = await DroneModal.find({modalNumber:data.modalNumber}, {_id:1,modalName:1})
            if(modalNameExesit.length && modalNumberExesist.length){
                errors.push('Modal with current name and number already exesist.')
            } else if(modalNameExesit.length){
                errors.push('Modal with current name already exesist.')
            } else if(modalNumberExesist.length) {
                errors.push('Modal wiht current number already exesist.')
            }

            //rendering page with errors if any
            if(errors.length){
                return res.render('pages/droneModal/newModal', {
                    ...req.body,
                    errors,
                    dataErrors
                })
            }

            // checking data types of all feilds
            for(let i = 0;i < numbericType.length;i++){
                if(!validator.isNumeric(data[numbericType[i]])){
                    dataErrors[`${numbericType[i]}`] = 1
                    sanitizeError = true
                } else {
                    dataErrors[`${numbericType[i]}`] = 0
                }
            }

            for(let i = 0;i < alphanumericType.length;i++){
                
                if(!validator.isAlphanumeric(data[alphanumericType[i]])){
                    dataErrors[`${alphanumericType[i]}`] = 1
                    sanitizeError = true
                } else {
                    dataErrors[`${alphanumericType[i]}`] = 0
                }
            }

            for(let i = 0;i < alphaType.length;i++){
                if(!validator.isAlpha(data[alphaType[i]])){
                    dataErrors[`${alphaType[i]}`] = 1
                    sanitizeError = true
                } else {
                    dataErrors[`${alphaType[i]}`] = 0
                }
            }

            // if error rerender page with errors
            if(sanitizeError){
                return res.render('pages/droneModal/newModal', {
                    ...req.body,
                    errors:['Please provid valid Data of red feilds'],
                    dataErrors
                })
            }

            req.body = data

        next()
    } catch (e) {
        console.log(e)
        res.status(500).render('pages/505Error')
    }
}

module.exports = developerDatavalidation