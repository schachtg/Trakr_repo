const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();
const projectsController = require("../controllers/projectsController");

router.post("/", authenticateToken, projectsController.createProject);
router.get("/", authenticateToken, projectsController.getUsersProjects);
router.get("/:project_id", authenticateToken, projectsController.getProjectById);
router.delete("/:project_id", authenticateToken, projectsController.deleteProject);
router.post("/next_sprint/:project_id", authenticateToken, projectsController.updateSprint);
router.post("/remove_user", authenticateToken, projectsController.removeUserFromProject);
router.post("/invite", authenticateToken, projectsController.inviteUserEmail);
router.get("/join_project/:token", projectsController.joinProject);

module.exports = router;