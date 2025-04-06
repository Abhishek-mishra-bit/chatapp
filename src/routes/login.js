const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login");

router.get("/login", loginController.getLoginPage);
router.post("/login", loginController.postLoginData);

module.exports = router;