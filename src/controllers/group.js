const path = require("path");
const rootDir = require("../utils/path");
const Group = require("../models/group");
const Message = require("../models/message");
const GroupMember = require("../models/groupMember");
const User = require("../models/user");
const groupMember = require("../models/groupMember");
const { getIO } = require("../utils/socket");


exports.createGroup = async(req, res)=>{
    try {
        const { name, members } = req.body;
        console.log("name and members:", name, members);
        
        const group = new Group({ name }); 
        await group.save();

        const adminEntry = new GroupMember({
          groupId:group._id,
          userId: req.user.id,
          isAdmin:true
        });

        const memberEntries =   members.map(userId => new GroupMember({
          groupId: group._id,
          userId,
          isAdmin:false
        }));     
        
        await GroupMember.insertMany([adminEntry, ...memberEntries]);

        res.status(201).json({ message: "Group created", group });
      } catch (err) {
        console.error("Error creating group", err);
        res.status(500).json({ error: "Server error" });
      }
}

exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberships = await GroupMember.find({userId });
    const groupIds = memberships.map(m => m.groupId);
    const groups = await Group.find({ _id: { $in: groupIds } });


    const response = groups.map(group => ({
      id: group._id,
      name: group.name
    }));

    res.status(200).json(response); // remove the extra { groups } wrapper to match frontend
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
    
    const {groupId, message}= req.body;   
    const userId = req.user.id;

    let fileUrl = null;
    let fileType = null;

    if (req.file) {
      fileUrl = req.file.location;
      fileType = req.file.mimetype.split("/")[0]; // e.g., image, video
    }

    const msg = await Message.create({
      groupId,
      senderId: userId,
      senderName: req.user.name,
      message: message || null,
      fileUrl,
      fileType
    });
    
    const io = getIO();
    io.to(groupId).emit("new-message", {
      groupId,
      message,
      senderId: req.user._id,
      senderName: req.user.name
    });

    res.status(201).json({message:"Message sent"})
  }catch(err){
    console.error("Error sending message", err)
    res.status(500).json({message:"Faild to send message"})

  }
};

exports.searchUsers = async (req, res)=>{
  try{
    const query = req.query.q;
    const groupId = req.query.groupId;
    

    if (!query) return res.status(400).json({ message: "Query is required" });

    const regex = new RegExp(query, "i");
    let users = await User.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    }).select("_id name email phone");

    if (groupId) {
      const existingMembers = await GroupMember.find({ groupId }).select("userId");
      const memberIds = existingMembers.map(m => m.userId.toString());
      users = users.filter(u => !memberIds.includes(u._id.toString()));
    }


    res.json(users);

  }catch(err){
    console.error("User search failed", err);
    res.status(500).json({ message: "Search failed" });
  }  
}


exports.addMember = async(req, res)=>{
  try{
    const {groupId} = req.params;
    const {userId} = req.body;

    const isAdmin = await GroupMember.findOne({groupId, userId: req.user.id, isAdmin:true});
    if(!isAdmin) return res.status(403).json({ message: "Only admins can add members" });

    const alreadyMember = await GroupMember.findOne({groupId, userId});
    if (alreadyMember) return res.status(400).json({ message: "User already in group" });

    await GroupMember.create({groupId,userId, isAdmin:false});
    res.status(201).json({ message: "User added to group" });


  }catch(err){
    console.error("Failed to add member", err);
    res.status(500).json({ message: "Could not add user" });
  }
}

exports.isGroupAdmin = async(req, res)=>{
  try{
    const {groupId} = req.params;
    const userId = req.user.id;

    const adminRecord = await GroupMember.findOne({groupId, userId:req.user.id, isAdmin:true});

    res.status(200).json({isAdmin: !!adminRecord})
  }catch(err){
    console.error("Error checking admin status", err);
    res.status(500).json({ message: "Server error" });
  }
}

exports.getGroupMembers = async(req , res)=>{
  try{
    const { groupId } = req.params;
    const members = await groupMember.find({groupId}).populate("userId","name email");

    const response = members.map(m=>({
      userId : m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      isAdmin: m.isAdmin
    }));
    

      res.status(200).json(response);
  }catch(err){
    console.error("Failed to fetch group members", err);
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateAdminStatus = async(req, res)=>{
  try{
      const {groupId} = req.params;
      const {userId, makeAdmin} = req.body;

      
      //only admins can do this
      const requester = await GroupMember.findOne({groupId,userId: req.user.id, isAdmin:true});

      if(!requester) return res.status(403).json({messages:"only admins can change admin status"});

      const target = await GroupMember.findOne({groupId, userId});
      if (!target) return res.status(404).json({ message: "User not in group" });

      target.isAdmin = makeAdmin;
      await target.save();

      res.status(200).json({ message: `User ${makeAdmin ? 'promoted to' : 'demoted from'} admin` });


  }catch(err){
    console.error("Failed to update admin status", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // Prevent removing self
    if (req.user.id === userId) {
      return res.status(400).json({ message: "Admins can't remove themselves" });
    }

    // Only admins can remove
    const isAdmin = await GroupMember.findOne({ groupId, userId: req.user.id, isAdmin: true });
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    await GroupMember.deleteOne({ groupId, userId });
    res.status(200).json({ message: "User removed from group" });

  } catch (err) {
    console.error("Failed to remove member", err);
    res.status(500).json({ message: "Server error" });
  }
};

