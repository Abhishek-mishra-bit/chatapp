const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim: true,
            minLength:2,
            maxlength:30
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        phone:{
            type:String,
            length:10
        },
        password:{
            type:String,
            required:true,
            minLength:6
        }
        
    }
)   

userSchema.methods.getJWT = async function () {
    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET);
    return token;
}

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    const salt = await bcrypt.genSalt(2); // better to use 10 rounds
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.validatePassword = async function (enteredPassword) {    
    
    return await bcrypt.compare(enteredPassword,this.password);
}
const User = mongoose.model("User", userSchema);
module.exports = User;