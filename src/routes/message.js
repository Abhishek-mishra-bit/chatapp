const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message");
const verifyToken = require("../middleware/auth");

router.post("/send", verifyToken.authenticate, messageController.sendMessage);
router.get("/all", verifyToken.authenticate, messageController.getAllMessage)

module.exports = router;
