const app = require('./expressSetup/express')
const express = require('express')

app.use(express.static(__dirname + '/frontEnd/public/'))
//starting the app
app.listen(process.env.PORT, () => {
    console.log(`app is running on port ${process.env.PORT}`)
})