require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");


const connectDB = require("./src/utils/db");


const signupRoutes = require("./src/routes/signup");
const loginRoutes = require("./src/routes/login");
const chatRoutes = require("./src/routes/chat");
const messageRoutes = require("./src/routes/message");
const User = require("./src/models/user");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "src", "public")));



app.use("/user", signupRoutes);
app.use("/users", loginRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

connectDB()
    .then(()=>{
        app.listen(process.env.PORT || 3000, ()=>{
            console.log("Server is running on port: 3000");
            
        })
    })
    .catch((err)=>{
        console.error("Error in server server", err);
    });