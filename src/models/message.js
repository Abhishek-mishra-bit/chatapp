const mongoose = require("mongoose");

const msgSchema = new mongoose.Schema(
    {
        message:{
            type:String,
            required:true
        },
        userId:{
            required:true,
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        groupId:{
            required:true,
            type: mongoose.Schema.Types.ObjectId,
            ref:"Group"
        },
        fileUrl: {
            type: String,
            default: null
        },
        fileType: {
            type: String,
            default: null
        }
          
        
    },
    {timestamps:true}
)

module.exports = mongoose.model("Message",msgSchema);