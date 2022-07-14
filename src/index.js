const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route');
const multer=require('multer')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(multer().any());

mongoose.connect('mongodb+srv://AshutoshGupta:ashutosh54264850@cluster0.ukus0.mongodb.net/group13Database', {
  useNewUrlParser: true
})
.then(function(){
  console.log("Mongodb is connected successfully.");
})
.catch(function(err){
  console.log(err)
})

app.use('/', route);

app.listen(process.env.PORT || 3000, function(){
  console.log('Your app is running at port', process.env.PORT || 3000);
})