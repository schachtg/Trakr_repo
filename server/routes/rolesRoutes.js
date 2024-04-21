const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();
const rolesController = require("../controllers/rolesController");

router.post("/", authenticateToken, rolesController.createRoles);
router.get("/:project_id", authenticateToken, rolesController.getRolesInProject);
router.get("/users_permissions/:project_id", authenticateToken, rolesController.getPermissionsInRole)
router.put("/", authenticateToken, rolesController.updateRole);
router.post("/change_role", authenticateToken, rolesController.changeRole);
router.delete("/", authenticateToken, rolesController.deleteRole);

module.exports = router;