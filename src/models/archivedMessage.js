const mongoose = require("mongoose");

const archivedMsgSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      default: null
    },
    userId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    groupId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
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
  { timestamps: true }
);

module.exports = mongoose.model("ArchivedMessage", archivedMsgSchema);
