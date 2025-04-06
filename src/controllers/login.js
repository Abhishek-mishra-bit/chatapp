const path = require("path");
const rootDir = require("../utils/path");
const User = require("../models/user");

exports.getLoginPage = (req,res)=>{
    res.sendFile(path.join(rootDir,"views", "login.html"))
};

exports.postLoginData = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login data:", req.body);
    

    try {
        
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found, Please Signup" });
        }

        const isPasswordValid = await existingUser.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
            const token = await existingUser.getJWT();
                     
        

        return res.status(200).json({ message: "Login successful", token });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
