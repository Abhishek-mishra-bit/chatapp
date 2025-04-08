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
    const { lastMessageId } = req.query;
    let newMessages = [];
    if(lastMessageId){
      const lastMsg = await Message.findById(lastMessageId);
      if (lastMsg) {
          newMessages = await Message.find({ createdAt: { $gt: lastMsg.createdAt } })
              .populate('userId')
              .sort({ createdAt: 1 }); // sort in ascending time order
    }else {
      // If no ID provided, return the latest 10 messages
      newMessages = await Message.find()
          .populate('userId')
          .sort({ createdAt: -1 })
          .limit(10);
      
      // Reverse to keep oldest first
      newMessages = newMessages.reverse();
    }
    const messages = await Message.find().populate("userId", "name");
   
    
    res.status(200).json({success: true, messages});
  }}catch(err){
    res.status(500).json({success:false, message:"Failed to fetch the message", err});    
  }
 }
  