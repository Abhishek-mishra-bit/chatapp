const message = require("../models/message");
const Message = require("../models/message");

exports.sendMessage = async(req, res)=>{
    
    try{
        const {message } = req.body;      
        const userId = req.user._id;       
        const newMessages = new Message({ message, userId});
        await newMessages.save();
        res.status(201).json({ success: true, message: "Message saved", data: newMessages });
    } catch (error) {
      res.status(500).json({ success: false, message: "Something went wrong", error });
    }
 };

 exports.getAllMessage=async(req, res)=>{
  try{
    const messages = await Message.find().populate("userId", "name");
   
    
    res.status(200).json({success: true, messages});
  }catch(err){
    res.status(500).json({success:false, message:"Failed to fetch the message", err});    
  }
 }
  