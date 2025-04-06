require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");


const connectDB = require("./src/utils/db");


const signupRoutes = require("./src/routes/signup");
const { error } = require("console");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "src", "public")));



app.use("/user", signupRoutes)
  

connectDB()
    .then(()=>{
        app.listen(process.env.PORT || 3333, ()=>{
            console.log("Server is running on port: 3333");
            
        })
    })
    .catch((err)=>{
        console.error("Error in server server", err);
    });