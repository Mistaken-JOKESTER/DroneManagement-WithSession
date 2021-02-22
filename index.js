const app = require('./expressSetup/express')
const express = require('express')
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: true ,
    useCreateIndex:true
  }).then(response =>{
    console.log("mongo is running")
  }).catch(e =>{
    console.log(e)
  })

app.use(express.static(__dirname + '/frontEnd/public/'))
//starting the app
app.listen(process.env.PORT, () => {
    console.log(`app is running on port ${process.env.PORT}`)
})