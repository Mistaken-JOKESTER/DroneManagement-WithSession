const session = require('express-session')
const sessionConfig = require('./sessionConfig')

module.exports = session(sessionConfig)