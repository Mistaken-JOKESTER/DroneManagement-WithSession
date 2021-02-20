const mongoose = require('mongoose')

//Connecting to database
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