//all developer related routes
const express = require('express')
const cookieParser = require('cookie-parser')
var flash = require('connect-flash')

const router= express.Router()
const startSession = require('../../sessionSetup/startSession')

//routes
const passwordChangeRoutes = require('./passwordChange')
const homeRoutes = require('./home')
const droneModalsRoutes = require('./droneModals')
const verifyAcountAndRegisterCustomerRoutes = require('./verifyAndRegisterCustomer')
const dronesRoute = require('./drone')
const downloadRoute = require('./download') 


//cookies and urlencoded data setup
router.use(cookieParser())
router.use(flash());
        
//starting sesssion for developer
router.use(startSession)

router.use('/home', homeRoutes)
router.use('/password', passwordChangeRoutes)
router.use('/dronemodal', droneModalsRoutes)
router.use('/verifyandregister', verifyAcountAndRegisterCustomerRoutes)
router.use('/drones', dronesRoute)
router.use('/download', downloadRoute)


module.exports = router