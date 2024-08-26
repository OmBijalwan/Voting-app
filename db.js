const mongoose = require('mongoose');
// if code is not running then always check or replace localhost with 127.0.0.1

// //Set up MongoDB connection
// Update your connection string
mongoose.connect('mongodb://127.0.0.1:27017/Voting');
require('dotenv').config();

//const MongoUrl = process.env.DB_URL;

//mongoose.connect(MongoUrl);

// mongoose.connect(MongoUrl, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

  

//Get the default connection
//Mongoose maintains a default connection object representing 
const db= mongoose.connection;

// Define event Listeners for databse connections
db.on('connected', ()=>{
    console.log('Connected to MongoDb server');
});

db.on('error',(err) =>{
    console.error('MongoDB connection error:', err);
});

db.on('disconnected' , () =>{
    console.log('MoongoDB disconnected');
});

//export databse connection

module.exports = db;







