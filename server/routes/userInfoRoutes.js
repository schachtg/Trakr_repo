const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();
const userInfoController = require("../controllers/userInfoController");
require('dotenv');

router.post("/create", userInfoController.createUser);
router.patch("/reset_password", userInfoController.resetPassword);
router.post("/login", userInfoController.login);
router.get("/logout", userInfoController.logout);
router.get("/verify", authenticateToken, userInfoController.verifyUser);
router.put("/open_project", authenticateToken, userInfoController.updateOpenProject);
router.get("/", authenticateToken, userInfoController.getUserInfo);
router.get("/project/:project_id", authenticateToken, userInfoController.getUserInProjectInfo);

module.exports = router;