//loading env variables
//use on dev servers
//
// PORT=3000
// ACCESS_TOKEN_SECRET
// MONGO_URL
// LOGIN_TOKEN_SECRETE
// SESSION_SECRETE
// LOGIN_ID_SECRETE
// OPERATORBUSINESSIDENTIFIER
// MANUFACTURERBUSINESSIDENTIFIER
require('dotenv').config()

const path = require('path')
const helmet = require("helmet")
const express = require('express')
const cors = require('cors')
const databaseConnection = require('../databaseConnection/mongodb')

//routers
const routes = require('../routes/routes')

const app = express()
//helmet provide some security middlewares
// app.use(helmet())
//view engine setup
app.set('views', path.join(__dirname, '../frontEnd/views'))
app.set('view engine', 'ejs')
app.set('trust proxy', 1) // trust first proxy
app.use(cors())



//basic route/entry route
// Access the session as req.session
app.get('/', (req, res) => {
    try{
      res.send('<h1>Welcome To drone Point app</h1><a href="/developer/home">Developer</a>')
    } catch (e) {
      console.log(e)
      res.status(500).render('pages/505Error')
    }
})

//developer routes setup
app.use('/', routes)

module.exports = app