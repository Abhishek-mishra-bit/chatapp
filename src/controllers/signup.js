const path = require("path");
const rootDir = require("../utils/path");
const User = require("../models/user");

exports.getSignupPage = (req,res)=>{
    res.sendFile(path.join(rootDir,"views", "signup.html"))

}

exports.postSignupdata = async (req, res)=>{
    const{name,email,password,phone} = req.body ;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            
            return res.status(409).json({message: "User already exists, Please Login"})
        }

        const newUser = new User({name, email, phone,password});
        await newUser.save();
        return res.status(201).json({message:"User created succesfully"});
    }catch(err){
        console.error("Error:", err);
        return res.status(500).json({message:"Internal server error"});
    }
}