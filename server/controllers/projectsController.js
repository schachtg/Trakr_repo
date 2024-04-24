const pool = require('../db');
const { sendInviteEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

const createProject = async (req, res) => {
    try {
      const { name } = req.body;
      const email = req.user.email;
      const curr_sprint = 1;
  
      // Get user's id
      const checkUser = await pool.query(
        `SELECT * FROM user_info WHERE email = $1`,
        [email]
      );
      if(checkUser.rowCount === 0) {
        res.status(404).json("User not found");
        return;
      }
  
      // Create a new project (name can be duplicated but will have different id)
      const newProject = await pool.query(
        `INSERT INTO projects (name, user_emails, curr_sprint) VALUES ($1, $2, $3) RETURNING *`,
        [name, [email], curr_sprint]
      );
  
      res.status(201).json(newProject.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  
    return;
};

const getUsersProjects = async (req, res) => {
    try {
      const email = req.user.email;
  
      const allProjects = await pool.query(
        `SELECT * FROM projects WHERE $1 = ANY(user_emails)`,
        [email]
      );
      res.json(allProjects.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getProjectById = async (req, res) => {
    try {
      const email = req.user.email;
      const { project_id } = req.params;
      const project = await pool.query(
        `SELECT * FROM projects WHERE $1 = ANY(user_emails) AND project_id = $2`,
        [email, project_id]
      );
      if (project.rowCount === 0) {
        res.status(404).json("Project not found");
        return;
      }
      res.json(project.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const deleteProject = async (req, res) => {
    try {
      const { project_id } = req.params;
      const email = req.user.email;
  
      // Check if user is in the project
      const user_list = await pool.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id]
      );
  
      await pool.query(
        `UPDATE user_info SET open_project = NULL WHERE open_project = $1`,
        [project_id]
      );
  
      if (user_list.rows[0].user_emails.includes(email)) {
        // Deletes everything referencing the project
        const client = await pool.connect();
  
        try {
          await client.query('BEGIN');
        
          await client.query('DELETE FROM tickets WHERE project_id = $1', [project_id]);
          await client.query('DELETE FROM epics WHERE project_id = $1', [project_id]);
          await client.query('DELETE FROM cols WHERE project_id = $1', [project_id]);
          await client.query('DELETE FROM roles WHERE project_id = $1', [project_id]);
          await client.query('DELETE FROM projects WHERE project_id = $1', [project_id]);
        
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
  
        res.status(200).json("Project was deleted!");
      } else {
        res.status(401).json("User is not in the project");
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const updateSprint = async (req, res) => {
    try {
      const { project_id } = req.params;
      const email = req.user.email;
  
      // Check if user is in the project
      const user_list = await pool.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id]
      );
  
      if (user_list.rows[0].user_emails.includes(email)) {
        const currSprint = user_list.rows[0].curr_sprint;
        await pool.query(
          `UPDATE projects SET curr_sprint = $1 WHERE project_id = $2`,
          [currSprint + 1, project_id]
        );
  
        // Delete tickets in done column
        await pool.query(
          `DELETE FROM tickets WHERE project_id = $1 AND sprint = $2 AND column_name = 'Done'`,
          [project_id, currSprint]
        );
  
        // Update any tickets that are in the current sprint
        await pool.query(
          `UPDATE tickets SET sprint = $1 WHERE project_id = $2 AND sprint = $3`,
          [currSprint + 1, project_id, currSprint]
        );
  
        // Reset the size of the done column
        const columns = await pool.query(
          `SELECT * FROM cols WHERE project_id = $1`,
          [project_id]
        );
  
        const doneCol = columns.rows.find(column => column.name === "Done");
        if (doneCol !== undefined) {
          await pool.query(
            `UPDATE cols SET size = 0 WHERE col_id = $1`,
            [doneCol.col_id]
          );
        }
        
        res.status(200).json("Next sprint was set!");
      } else {
        res.status(401).json("User is not in the project");
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const removeUserFromProject = async (req, res) => {
  try {
    const { email, project_id } = req.body;
    const currUser = req.user.email;

    // Check if user is in the project
    const user_list = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );

    if (user_list.rows[0].user_emails.includes(currUser)) {
      // Check if user is in the project
      if (user_list.rows[0].user_emails.includes(email)) {
        // Remove user from project
        await pool.query(
          `UPDATE projects SET user_emails = $1 WHERE project_id = $2`,
          [user_list.rows[0].user_emails.filter(user => user !== email), project_id]
        );

        // Remove user from roles in the project
        const roles = await pool.query(
          `SELECT * FROM roles WHERE $1 = ANY(user_emails) AND project_id = $2`,
          [email, project_id]
        );

        if (roles.rowCount === 0) {
          res.status(404).json("Role not found");
          return;
        }

        await pool.query(
          `UPDATE roles SET user_emails = $1 WHERE role_id = $2`,
          [roles.rows[0].user_emails.filter(user => user !== email), roles.rows[0].role_id]
        );

        // Remove user's open project if it was the project that was removed
        const user = await pool.query(
          `SELECT * FROM user_info WHERE email = $1`,
          [email]
        );
        if (user.rows[0].open_project === project_id) {
          await pool.query(
            `UPDATE user_info SET open_project = NULL WHERE email = $1`,
            [email]
          );
        }
        res.status(200).json("User was removed from the project");
      } else {
        res.status(404).json("User is not in the project");
      }
    } else {
      res.status(404).json("User is not in the project");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const inviteUserEmail = async (req, res) => {
  try {
    const { recipient_email, project_id } = req.body;
    const { email } = req.user;

    // Check if project exists
    const project = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );
    if (project.rowCount === 0) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Check if user is in the project
    if (!project.rows[0].user_emails.includes(email)) {
      res.status(401).json({ message: "User is not in the project" });
      return;
    }

    // Check if recipient is already in the project
    if (project.rows[0].user_emails.includes(recipient_email)) {
      res.status(409).json({ message: "User is already in the project" });
      return;
    }

    // Check if an account exists for recipient
    const recipient = await pool.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [recipient_email]
    );
    if (recipient.rowCount === 0) {
      res.status(404).json({ message: "There is no account matching that email" });
      return;
    }

    // Code to send email
    sendInviteEmail(req.body)
    .then((response) => res.status(200).json({message: response.message}))
    .catch((err) => res.status(500).json({message: err.message}));
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const joinProject = async (req, res) => {
  try {
    const { token } = req.params;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const { project_id, email } = decodedToken;

      // Check if project exists
      const project = await pool.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id]
      );
      if (project.rowCount === 0) {
        res.status(404).json({ message: "Project not found" });
        return;
      }

      // Check if user is already in the project
      if (project.rows[0].user_emails.includes(email)) {
        res.status(409).json({ message: "User is already in the project" });
        return;
      }

      // Add user to project
      await pool.query(
        `UPDATE projects SET user_emails = $1 WHERE project_id = $2`,
        [[...project.rows[0].user_emails, email], project_id]
      );

      // Add email to default role
      const defaultRole = await pool.query(
        `SELECT * FROM roles WHERE project_id = $1 AND name = $2`,
        [project_id, "Default"]
      );
      if (defaultRole.rowCount === 0) {
        res.status(404).json({ message: "Default role not found" });
        return;
      }

      await pool.query(
        `UPDATE roles SET user_emails = $1 WHERE role_id = $2`,
        [[...defaultRole.rows[0].user_emails, email], defaultRole.rows[0].role_id]
      );

      res.status(200).json({ message: "User was added to the project" });
    });

  } catch (e) {
    res.status(500).send(e.message);
  }
};

module.exports = { createProject, getUsersProjects, getProjectById, deleteProject, updateSprint, removeUserFromProject, inviteUserEmail, joinProject };