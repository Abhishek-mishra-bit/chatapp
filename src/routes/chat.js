const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");

router.get("/chatWindow", chatController.getChatPage);
router

module.exports = router;
