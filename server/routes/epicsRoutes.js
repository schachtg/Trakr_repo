const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();
const epicsController = require("../controllers/epicsController");

router.post("/", authenticateToken, epicsController.createEpic);
router.get("/:project_id", authenticateToken, epicsController.getEpicsInProject);
router.put("/", authenticateToken, epicsController.updateEpic);
router.delete("/", authenticateToken, epicsController.deleteEpic);

module.exports = router;