const Message = require("../models/message");

exports.sendMessage = async(req, res)=>{
    console.log("req body", req.body);
    try{
        const {message } = req.body;
        console.log("req user id", req.user._id);
        

        const userId = req.user._id;
        console.log("userid", userId);
        

        const newMessages = new Message({ message, userId});
        await newMessages.save();
        res.status(201).json({ success: true, message: "Message saved", data: newMessages });
    } catch (error) {
      res.status(500).json({ success: false, message: "Something went wrong", error });
    }
 };
  