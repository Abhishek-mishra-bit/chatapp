const express = require("express");
const router = express.Router();
const signupController = require("../controllers/signup")
const verifyToken = require("../middleware/auth");

router.get("/signup", signupController.getSignupPage);
router.post("/signup", signupController.postSignupdata);
router.get("/all", verifyToken.authenticate, signupController.getAllGroup);

module.exports = router;