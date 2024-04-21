const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();
const colsController = require("../controllers/colsController");

router.post("/", authenticateToken, colsController.createColumns);
router.post("/add_single", authenticateToken, colsController.addSingleColumn);
router.get("/:project_id", authenticateToken, colsController.getColumnsInProject);
router.put("/", authenticateToken, colsController.updateColumn);
router.delete("/", authenticateToken, colsController.deleteColumn);

module.exports = router;