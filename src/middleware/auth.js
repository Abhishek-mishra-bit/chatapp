const JWT = require("jsonwebtoken");
const User = require("../models/user")

exports.authenticate = async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
  
      if (!authHeader) {
        return res
          .status(401)
          .json({ success: false, message: "Access denied. No token provided." });
      }
  
      const token = authHeader;
  
      const decoded = JWT.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) return res.status(401).json({ message: "Unauthorized, user not found" });
      console.log("user is :" , user);
  
      req.user = user; // attach user to request
      console.log("Req is ;" , req.user);
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };