const mongoose = require('mongoose')
const connectMongo = require('connect-mongo')
const session = require('express-session')
const MongoStore = connectMongo(session)
const genuuid = require('./sessionUUID')

//Session Setup
const sessionConfig= ({
    genid: function(req){
        return genuuid()
    },
    store: new MongoStore({ 
        mongooseConnection: mongoose.connection,
        dbName: 'DronePointSessions'
    }),
    name:'sid',
    resave:false,
    secret: process.env.SESSION_SECRETE,
    resave: false,
    saveUninitialized: true,
    rolling:true,
    resave:false,
    cookie: { 
        httpOnly: true,
        // secure: true,  //Turn it on in Production
        maxAge: 1000 * 60 * 15,
        sameSite:true
    }
})

module.exports = sessionConfig