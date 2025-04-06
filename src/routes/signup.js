const express = require("express");
const router = express.Router();
const signupController = require("../controllers/signup")

router.get("/signup", signupController.getSignupPage);
router.post("/signup", signupController.postSignupdata);

module.exports = router;