const express = require('express')
const router = express.Router()
router.use(express.json())
router.use(express.urlencoded({extended:true}))

const customerRoutes = require('./customer/router')
const developerRoutes = require('./developer/router')
const pilotRoutes = require('./pilot/router')

router.use('/developer', developerRoutes)
router.use('/customer', customerRoutes)
router.use('/pilot', pilotRoutes)

module.exports = router