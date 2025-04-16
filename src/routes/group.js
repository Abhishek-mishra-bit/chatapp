const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group");
const verifyToken = require("../middleware/auth");

router.post("/create",verifyToken.authenticate,groupController.createGroup);
router.get("/my-groups", verifyToken.authenticate, groupController.getMyGroups);
router.get('/mine', verifyToken.authenticate, groupController.getMyGroups);
router.post('/send-message', verifyToken.authenticate, groupController.sendMessage);


router.get("/:groupId/messages", verifyToken.authenticate, groupController.getGroupMessages);

module.exports = router;