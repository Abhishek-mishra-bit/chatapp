const path = require("path");
const rootDir = require("../utils/path");
const Group = require("../models/group");
const Message = require("../models/message");
const message = require("../models/message");

exports.createGroup = async(req, res)=>{
    try {
        const { name, members } = req.body;
    
        // Include admin in the members list too
        const allMembers = Array.from(new Set([...members, req.user.id]));
    
        const group = new Group({
          name,  
          admin: req.user.id,
          members: allMembers
        });
    
        await group.save();
        res.status(201).json({ message: "Group created", group });
      } catch (err) {
        console.error("Error creating group", err);
        res.status(500).json({ error: "Server error" });
      }
}

exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const userGroups = await Group.find({ members: userId });
    const groups = userGroups.map(group => ({
      id: group._id,
      name: group.name
    }));

    res.status(200).json(groups); // remove the extra { groups } wrapper to match frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

   

exports.getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const messages = await Message.find({ groupId })
      .populate('userId', 'name') // only fetch user's name
      .sort({ createdAt: 1 })      // oldest to newest
      .lean();                     // improve performance

    const response = messages.map(msg => ({
      _id: msg._id,
      message: msg.message,
      senderId: msg.userId._id,
      senderName: msg.userId.name,
      createdAt: msg.createdAt,
    }));
    
    

    res.json(response);
  } catch (err) {
    console.error("Error fetching group messages", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
};


exports.sendMessage = async (req, res) => {
  try{
    console.log("req is 61:", req.user);
    
    const {groupId, message}= req.body;   
    const newMessage = new Message({
      userId: req.user._id,
      groupId,
      message
    })
    await newMessage.save();
    res.status(201).json({message:"Message sent"})
  }catch(err){
    console.error("Error sending message", err)
    res.status(500).json({message:"Faild to send message"})

  }
};


