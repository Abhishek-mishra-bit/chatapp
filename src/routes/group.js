const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group");
const verifyToken = require("../middleware/auth");
const upload = require("../utils/s3");


router.post("/create",verifyToken.authenticate,groupController.createGroup);
router.get("/my-groups", verifyToken.authenticate, groupController.getMyGroups);
router.get('/mine', verifyToken.authenticate, groupController.getMyGroups);
router.post('/send-message', verifyToken.authenticate,upload.single("file"), groupController.sendMessage);


router.get("/:groupId/messages", verifyToken.authenticate, groupController.getGroupMessages);
router.get("/search-users",verifyToken.authenticate, groupController.searchUsers);
router.get('/:groupId/members', verifyToken.authenticate, groupController.getGroupMembers);

router.post('/:groupId/add-member', verifyToken.authenticate, groupController.addMember);
router.get("/:groupId/is-admin", verifyToken.authenticate, groupController.isGroupAdmin);

router.patch('/:groupId/update-admin', verifyToken.authenticate, groupController.updateAdminStatus);
router.delete('/:groupId/remove-member', verifyToken.authenticate, groupController.removeMember);
router.delete('/:groupId/remove-member', verifyToken.authenticate, groupController.removeMember);




module.exports = router;