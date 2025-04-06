const path = require("path");
const rootDir = require("../utils/path");
const User = require("../models/user");


exports.getChatPage = (req, res) => {
    // Assuming you have a chat window HTML file in the views directory
    
    res.sendFile(path.join(rootDir, "views", "chatWindow.html"));
};