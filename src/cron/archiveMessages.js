const cron = require("node-cron");
const Message = require("../models/message");
const ArchivedMessage = require("../models/archivedMessage");

// Schedule to run every night at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  console.log("🕑 Archiving messages older than 1 day...");

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  try {

    await Message.deleteMany({ groupId: null });

    // Find old messages
    const oldMessages = await Message.find({
      createdAt: { $lt: oneDayAgo }
    });    


    if (oldMessages.length === 0) {
      console.log("📭 No messages to archive");
      return;
    }

    // Insert into archive collection
    const archivedData = oldMessages.map(msg => ({
        message: msg.message || null,
        userId: msg.userId,
        groupId: msg.groupId || null,
        fileUrl: msg.fileUrl || null,
        fileType: msg.fileType || null,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      }));

      await ArchivedMessage.insertMany(archivedData);
      

    // Delete from original collection
    await Message.deleteMany({ _id: { $in: oldMessages.map(m => m._id) } });

    console.log(`📦 Archived ${oldMessages.length} messages`);
  } catch (err) {
    console.error("❌ Error archiving messages:", err);
  }
});
