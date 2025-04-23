const mongoose = require("mongoose");

const groupMemberSchema = new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
      joinedAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model("GroupMember", groupMemberSchema);