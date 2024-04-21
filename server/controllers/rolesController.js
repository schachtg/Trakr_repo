const pool = require('../db');

const createRoles = async (req, res) => {
    const { roles, project_id } = req.body;
  
    try {
      if (roles.length > 0) {
        for (let i = 0; i < roles.length; i++) {
          // Check if role with the same name exists
          const checkRole = await pool.query(
            `SELECT * FROM roles WHERE name = $1 AND project_id = $2`,
            [roles[i].name, project_id]
          );
  
          if (checkRole.rowCount > 0) {
            res.status(409).json("Role already exists");
            return;
          }
  
          const newRole = await pool.query(
            `INSERT INTO roles (name, permissions, user_emails, project_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [roles[i].name, roles[i].permissions, roles[i].user_emails, project_id]
          );
  
          if(newRole.rowCount === 0) {
            res.status(201).json("An error occured");
            return;
          }
        }
  
        res.status(201).json("Roles were added");
      } else {
        res.status(200).json("No roles were added");
      }
    } catch (err) {
      console.error(err.message);
    }
};

const getRolesInProject = async (req, res) => {
    try {
      const { project_id } = req.params;
      const roles = await pool.query(
        `SELECT * FROM roles WHERE project_id = $1 ORDER BY name ASC`,
        [project_id]
      );
      res.json(roles.rows);
    } catch (err) {
      console.error(err.message);
    }
};

const getPermissionsInRole = async (req, res) => {
    try {
      const { project_id } = req.params;
      const email = req.user.email;
  
      // Check if user is in the project
      const user_list = await pool.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id]
      );
  
      if (user_list.rows[0].user_emails.includes(email)) {
        const roles = await pool.query(
          `SELECT * FROM roles WHERE $1 = ANY(user_emails) AND project_id = $2`,
          [email, project_id]
        );
  
        if (roles.rowCount === 0) {
          res.status(404).json("Role not found");
          return;
        }
  
        res.status(200).json(roles.rows[0].permissions);
      } else {
        res.status(401).json("User is not in the project");
      }
    } catch (err) {
      console.error(err.message);
    }
};

const updateRole = async (req, res) => {
    try {
      const { role_id, project_id, name, permissions, user_emails } = req.body;
      const email = req.user.email;
  
      // Check if user is in the project
      const user_list = await pool.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id]
      );
  
      if (user_list.rows[0].user_emails.includes(email)) {
        // Check if role with the same name exists
        const checkRole = await pool.query(
          `SELECT * FROM roles WHERE name = $1 AND project_id = $2`,
          [name, project_id]
        );
  
        if (checkRole.rowCount > 0 && checkRole.rows[0].role_id !== role_id) {
          res.status(409).json("Role already exists");
          return;
        }
  
        const updatedRole = await pool.query(
          `UPDATE roles SET name = $1, permissions = $2, user_emails = $3 WHERE role_id = $4 RETURNING *`,
          [name, permissions, user_emails, role_id]
        );
        res.status(200).json(updatedRole.rows[0]);
      } else {
        res.status(401).json("User is not in the project");
      }
    } catch (err) {
      console.error(err.message);
    }
};

const changeRole = async (req, res) => {
    try {
      const { email, role_name, project_id } = req.body;
      const currUser = req.user.email;
  
      // Check if currUser is in the project
      const user_list = await pool.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id]
      );
  
      if (user_list.rows[0].user_emails.includes(currUser)) {
        // Check if user being updated is in the project
        if (user_list.rows[0].user_emails.includes(email)) {
          const oldRole = await pool.query(
            `SELECT * FROM roles WHERE $1 = ANY(user_emails) AND project_id = $2`,
            [email, project_id]
          );
          if (oldRole.rowCount === 0) {
            res.status(404).json("Role not found");
            return;
          }
  
          // Removes user from current role
          await pool.query(
            `UPDATE roles SET user_emails = $1 WHERE role_id = $2 AND project_id = $3`,
            [oldRole.rows[0].user_emails.filter((curr) => curr !== email), oldRole.rows[0].role_id, project_id]
          );
  
          const newRole = await pool.query(
            `SELECT * FROM roles WHERE name = $1 AND project_id = $2`,
            [role_name, project_id]
          );
          if (newRole.rowCount === 0) {
            res.status(404).json("Role not found");
            return;
          }
  
          // Adds user to new role
          await pool.query(
            `UPDATE roles SET user_emails = $1 WHERE role_id = $2 AND project_id = $3`,
            [[...newRole.rows[0].user_emails, email], newRole.rows[0].role_id, project_id]
          );
  
          // Get updated roles
          const roles = await pool.query(
            `SELECT * FROM roles WHERE project_id = $1 ORDER BY name ASC`,
            [project_id]
          );
  
          res.status(200).json(roles.rows);
        } else {
          res.status(404).json("User is not in the project");
        }
      } else {
        res.status(401).json("You are not in the project");
      }
    } catch (err) {
      console.log(err.message);
    }
};

const deleteRole = async (req, res) => {
    try {
      const { role_id, project_id } = req.body;
      const email = req.user.email;
  
      // Check if user is in the project
      const user_list = await pool.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id]
      );
  
      if (user_list.rows[0].user_emails.includes(email)) {
        // Move users in deleting role to default role
        const defaultRole = await pool.query(
          `SELECT * FROM roles WHERE project_id = $1 AND name = $2`,
          [project_id, "Default"]
        );
  
        if (defaultRole.rowCount === 0) {
          res.status(404).json("Default role not found");
          return;
        }
  
        const deletingRole = await pool.query(
          `SELECT * FROM roles WHERE role_id = $1`,
          [role_id]
        );
  
        if (deletingRole.rowCount === 0) {
          res.status(404).json("Role not found");
          return;
        }
  
        await pool.query(
          `UPDATE roles SET user_emails = $1 WHERE role_id = $2`,
          [[...defaultRole.rows[0].user_emails, ...deletingRole.rows[0].user_emails], defaultRole.rows[0].role_id]
        );
  
        await pool.query(
          `DELETE FROM roles WHERE role_id = $1`,
          [role_id]
        );
        res.status(200).json("Role was deleted!");
      } else {
        res.status(401).json("User is not in the project");
      }
    } catch (err) {
      console.log(err.message);
    }
};

module.exports = { createRoles, getRolesInProject, getPermissionsInRole, updateRole, changeRole, deleteRole };