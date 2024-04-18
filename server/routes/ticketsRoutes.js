const express = require("express");
const { authenticateToken } = require("../helperFunctions");
const router = express.Router();
const ticketsController = require("../controllers/ticketsController");

router.post("/", authenticateToken, ticketsController.createTicket);
router.get("/project/:project_id", authenticateToken, ticketsController.getTicketsByProjectId);
router.get("/:id", authenticateToken, ticketsController.getTicketById);
router.put("/:id", authenticateToken, ticketsController.updateTicket);
router.delete("/:id", authenticateToken, ticketsController.deleteTicket);

module.exports = router;