const path = require("path");
const rootDir = require("../utils/path");
const User = require("../models/user");


exports.getChatPage = (req, res) => { 
    res.sendFile(path.join(rootDir, "views", "chatWindow.html"));
};