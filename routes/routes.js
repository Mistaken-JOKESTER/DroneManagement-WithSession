const express = require('express')
const router = express.Router()
router.use(express.json())
router.use(express.urlencoded({extended:true}))

const customerRoutes = require('./customer/router')
const developerRoutes = require('./developer/router')

router.use('/developer', developerRoutes)
router.use('/customer', customerRoutes)

module.exports = router