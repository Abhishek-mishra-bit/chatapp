const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.DB_MONGO_URL;

const connectDB = async()=>{
    try{
        await mongoose.connect(uri);
        console.log("Connected to DB successfully");        
    }
    catch(err){
        console.error("Error connecting to DB", err);
        process.exit(1);        
    }
}

module.exports = connectDB;