const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv');

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000', '/api/v1/'];
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

//middleware
app.use(cors(corsOptions));
app.use(express.json()); //req.body
app.use(cookieParser());

//ROUTES//

// create a ticket
app.post("/api/v1/tickets", authenticateToken, async (req, res) => {
  try {
    const tableName = "tickets";
    const { name, priority, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project_id } = req.body;
    const username = req.user.email;

    const newTicket = await pool.query(
      `INSERT INTO ${tableName} (name, priority, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project_id, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [name, priority, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project_id, username]
    );

    // Update column size
    const columns = await pool.query(
      `SELECT * FROM cols WHERE project_id = $1`,
      [project_id]
    );

    const currCol = columns.rows.find(column => column.name === column_name);
    if (currCol !== undefined) {
      await pool.query(
        `UPDATE cols SET size = $1 WHERE col_id = $2`,
        [currCol.size + 1, currCol.col_id]
      );
    }

    res.json(newTicket.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// get all tickets for a project
app.get("/api/v1/tickets/project/:project_id", authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const tableName = "tickets";
    const allTickets = await pool.query(
      `SELECT * FROM ${tableName} WHERE project_id = $1 ORDER BY epic ASC`,
      [project_id]
    );
    res.json(allTickets.rows);
  } catch (err) {
    console.error(err.message);
  }
});


// get a ticket
app.get("/api/v1/tickets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await pool.query(
      `SELECT * FROM tickets WHERE ticket_id = $1`,
      [id]
    );
    if (ticket.rowCount === 0) {
      res.status(404).json("Ticket not found");
      return;
    }

    res.status(200).json(ticket.rows[0]);
  } catch (err) {
    res.status(404).json("Ticket not found");
  }
});

// update a ticket
app.put("/api/v1/tickets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, priority, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project_id } = req.body;

    // Get old ticket
    const oldTicket = await pool.query(
      `SELECT * FROM tickets WHERE ticket_id = $1`,
      [id]
    );

    if (oldTicket.rowCount === 0) {
      res.status(404).json("Ticket not found");
      return;
    }

    if (oldTicket.rows[0].column_name !== column_name) {
      // Update column size
      const columns = await pool.query(
        `SELECT * FROM cols WHERE project_id = $1`,
        [project_id]
      );

      const oldCol = columns.rows.find(column => column.name === oldTicket.rows[0].column_name);
      if (oldCol !== undefined) {
        await pool.query(
          `UPDATE cols SET size = $1 WHERE col_id = $2`,
          [oldCol.size - 1, oldCol.col_id]
        );
      }

      const newCol = columns.rows.find(column => column.name === column_name);
      if (newCol !== undefined) {
        await pool.query(
          `UPDATE cols SET size = $1 WHERE col_id = $2`,
          [newCol.size + 1, newCol.col_id]
        );
      }
    }

    const updateTicket = await pool.query(
      `UPDATE tickets SET name = $1, priority = $2, epic = $3, description = $4, blocks = $5, blocked_by = $6, points = $7, assignee = $8, sprint = $9, column_name = $10, pull_request = $11, project_id = $12 WHERE ticket_id = $13 RETURNING *`,
      [name, priority, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project_id, id]
    );

    res.json(updateTicket.rows[0]);
    } catch (err) {
    console.error(err.message);
  }
});

// delete a ticket
app.delete("/api/v1/tickets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get old ticket
    const oldTicket = await pool.query(
      `SELECT * FROM tickets WHERE ticket_id = $1`,
      [id]
    );

    if (oldTicket.rowCount === 0) {
      res.status(404).json("Ticket not found");
      return;
    }

    // Update column size
    const columns = await pool.query(
      `SELECT * FROM cols WHERE project_id = $1`,
      [oldTicket.rows[0].project_id]
    );

    const oldCol = columns.rows.find(column => column.name === oldTicket.rows[0].column_name);
    if (oldCol !== undefined) {
      await pool.query(
        `UPDATE cols SET size = $1 WHERE col_id = $2`,
        [oldCol.size - 1, oldCol.col_id]
      );
    }

    await pool.query(
      `DELETE FROM tickets WHERE ticket_id = $1`,
      [id]
    );
    res.json("Ticket was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});

// create a user
app.post("/api/v1/user_info/create", async (req, res) => {
  try {
    const tableName = "user_info";
    const { email, name, password } = req.body;

    const saltedHash = await bcrypt.hash(password, 10);

    const checkUser = await pool.query(
      `SELECT * FROM ${tableName} WHERE email = $1`,
      [email]
    );

    if (checkUser.rowCount > 0) {
      // If a user with the same email exists, return a response indicating that
      res.status(409).json("User already exists");
    } else {
      // If the user doesn't exist, proceed to insert them into the database
      const newUser = await pool.query(
        `INSERT INTO ${tableName} (email, name, password) VALUES ($1, $2, $3) RETURNING *`,
        [email, name, saltedHash]
      );
      res.status(201).json(newUser.rows[0]);
    }
  } catch (err) {
    console.error(err.message);
  }
});

app.patch("/api/v1/reset_password", async (req, res) => {
  try {
    const tableName = "user_info";
    const { recipient_email, password, token } = req.body;

    if (!token) {
      return res.status(401).json("No password reset token provided");
    }

    // Verify password reset token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken.recipient_email !== recipient_email) {
      await pool.query(
        `UPDATE ${tableName} SET token = NULL WHERE email = $1`,
        [recipient_email]
      );
      return res.status(401).json("Invalid password reset token");
    }
    if (decodedToken.exp < Date.now() / 1000) {
      await pool.query(
        `UPDATE ${tableName} SET token = NULL WHERE email = $1`,
        [recipient_email]
      );
      return res.status(401).json("Password reset token has expired");
    }

    // Update user's password
    const saltedHash = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE ${tableName} SET password = $1, token = NULL WHERE email = $2`,
      [saltedHash, recipient_email]
    );
    res.status(200).json("Password reset successful");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
});

// Check if username password is in the db
app.post("/api/v1/user_info/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkUser = await pool.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );

    if (checkUser.rowCount > 0) {
      const matching = await bcrypt.compare(password, checkUser.rows[0].password);
      if (matching) {
        const user = { email: email };
        const token = jwt.sign(user, process.env.JWT_SECRET);
        res.cookie('token', token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)});
        res.status(200).json("Found user");
      } else {
        res.status(401).json("Invalid password");
      }
    } else {
      res.status(404).json("User not found");
    }
  } catch (err) {
    res.status(404).json("User not found");
  }

  return;
});

app.get("/api/v1/user_info/logout", (req, res) => {
  res.clearCookie('token');
  res.status(200).json("Logged out");
});

app.get("/api/v1/user_info/verify", authenticateToken, (req, res) => {
  res.status(200).json("Valid token");
});

app.put("/api/v1/user_info/open_project", authenticateToken, async (req, res) => {
  try {
    const { open_project } = req.body;
    const email = req.user.email;
    const tableName = "user_info";

    // Make sure user is in the project
    const project = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [open_project]
    );

    if (project.rowCount === 0) {
      res.status(404).json("Project not found");
      return;
    }

    if (!project.rows[0].user_emails.includes(email)) {
      res.status(401).json("User is not in the project");
      return;
    }

    // Update user's info
    const updatedUser = await pool.query(
      `UPDATE ${tableName} SET open_project=$1 WHERE email = $2 RETURNING *`,
      [open_project, email]
    );
    res.status(200).json(updatedUser.rows[0]);
  } catch (err) {
    res.status(404).json("An error occured");
  }

  return;
});

app.get("/api/v1/user_info", authenticateToken, async (req, res) => {
  
  const { email } = req.user;
  const tableName = "user_info";

  // Use email to get user's data
  const userData = await pool.query(
    `SELECT * FROM ${tableName} WHERE email = $1`,
    [email]
  );

  res.status(200).json({email: req.user.email, name: userData.rows[0].name, id: userData.rows[0].user_id, open_project: userData.rows[0].open_project});
});

app.get("/api/v1/user_info/project/:project_id", authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const email = req.user.email;

    // Check if user is in the project
    const project = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );

    if (project.rowCount === 0) {
      res.status(404).json("Project not found");
      return;
    }

    if (project.rows[0].user_emails.includes(email)) {
      const userList = await pool.query(
        `SELECT user_id, name, email, open_project FROM user_info WHERE  email = ANY($1) ORDER BY name ASC`,
        [project.rows[0].user_emails]
      );
      res.status(200).json(userList.rows);
    } else {
      res.status(401).json("User is not in the project");
    }
  } catch (err) {
    console.error(err.message);
  }
});

// Create a project
app.post("/api/v1/projects", authenticateToken, async (req, res) => {
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
    res.status(404).json("An error occured");
  }

  return;
});

app.get("/api/v1/projects", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;

    const allProjects = await pool.query(
      `SELECT * FROM projects WHERE $1 = ANY(user_emails)`,
      [email]
    );
    res.json(allProjects.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/v1/projects/:project_id", authenticateToken, async (req, res) => {
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
    console.error(err.message);
  }
});

// delete a project
app.delete("/api/v1/projects/:project_id", authenticateToken, async (req, res) => {
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
    console.log(err.message);
  }
});

app.post("/api/v1/projects/next_sprint/:project_id", authenticateToken, async (req, res) => {
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
    console.log(err.message);
  }
});

app.post("/api/v1/epics", authenticateToken, async (req, res) => {
  const { name, color, project_id } = req.body;
  const email = req.user.email;

  // Check if user is in the project
  const user_list = await pool.query(
    `SELECT * FROM projects WHERE project_id = $1`,
    [project_id]
  );

  if (!user_list.rows[0].user_emails.includes(email)) {
    res.status(401).json("User is not in the project");
    return;
  }

  try {
      // Make sure an epic with that name is not in the project
      const checkEpic = await pool.query(
        `SELECT * FROM epics WHERE name = $1 AND project_id = $2`,
        [name, project_id]
      );

      if (checkEpic.rowCount > 0) {
        res.status(409).json("Epic already exists");
        return;
      }

      const newEpic = await pool.query(
        `INSERT INTO epics (name, project_id, color) VALUES ($1, $2, $3) RETURNING *`,
        [name, project_id, color]
      );

      if(newEpic.rowCount === 0) {
        res.status(201).json("An error occured");
        return;
      }

      res.status(201).json(newEpic.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/v1/epics/:project_id", authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const email = req.user.email;

    // Check if user is in the project
    const user_list = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );

    if (!user_list.rows[0].user_emails.includes(email)) {
      res.status(401).json("User is not in the project");
      return;
    }

    const epics = await pool.query(
      `SELECT * FROM epics WHERE project_id = $1`,
      [project_id]
    );
    res.json(epics.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.put("/api/v1/epics", authenticateToken, async (req, res) => {
  try {
    const { epic_id, project_id, name, color } = req.body;
    const email = req.user.email;

    // Check if user is in the project
    const user_list = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );

    if (!user_list.rows[0].user_emails.includes(email)) {
      res.status(401).json("User is not in the project");
      return;
    }

    // Check if an epic with the same name exists
    const checkEpic = await pool.query(
      `SELECT * FROM epics WHERE name = $1 AND project_id = $2`,
      [name, project_id]
    );

    if (checkEpic.rowCount > 0) {
      res.status(409).json("Epic already exists");
      return;
    }

    const updatedEpic = await pool.query(
      `UPDATE epics SET name = $1, color = $2 WHERE epic_id = $3 RETURNING *`,
      [name, color, epic_id]
    );
    res.status(200).json(updatedEpic.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// delete an epic
app.delete("/api/v1/epics", authenticateToken, async (req, res) => {
  try {
    const { epic_id, project_id } = req.body;
    const email = req.user.email;

    // Check if user is in the project
    const user_list = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );

    if (!user_list.rows[0].user_emails.includes(email)) {
      res.status(401).json("User is not in the project");
      return;
    }

    await pool.query(
      `DELETE FROM epics WHERE epic_id = $1`,
      [epic_id]
    );
    res.status(200).json("Epic was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/api/v1/remove_user", authenticateToken, async (req, res) => {
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
      res.status(401).json("User is not in the project");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/api/v1/cols", authenticateToken, async (req, res) => {
  const { columns } = req.body;
  const email = req.user.email;

  try {
    if (columns.length > 0) {
      let oldCol = {rows:[{col_id: -1}]};
      for (let i = columns.length-1; i >= 0; i--) {
        oldCol = await pool.query(
          `INSERT INTO cols (name, max, project_id, size, next_col) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [columns[i].name, columns[i].max, columns[i].project_id, columns[i].size, oldCol.rows[0].col_id]
        );

        if(oldCol.rowCount === 0) {
          res.status(201).json("An error occured");
          return;
        }
      }

      res.status(201).json("Columns were added");
    } else {
      res.status(200).json("No columns were added");
    }
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/api/v1/cols/add_single", authenticateToken, async (req, res) => {
  const { name, max, project_id } = req.body;
  const size = 0;
  const next_col = -1;
  const email = req.user.email;

  try {
    // Check if column with the same name exists
    const checkCol = await pool.query(
      `SELECT * FROM cols WHERE name = $1 AND project_id = $2`,
      [name, project_id]
    );

    if (checkCol.rowCount > 0) {
      res.status(409).json("Column already exists");
      return;
    }

    const firstCol = await pool.query(
      `SELECT * FROM cols WHERE project_id = $1 AND next_col = -1`,
      [project_id]
    );
    const newCol = await pool.query(
      `INSERT INTO cols (name, max, project_id, size, next_col) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, max, project_id, size, next_col]
    );

    if(firstCol.rowCount === 0) {
      res.status(201).json(newCol.rows[0]);
      return;
    }
    await pool.query(
      `UPDATE cols SET next_col = $1 WHERE col_id = $2 RETURNING *`,
      [newCol.rows[0].col_id, firstCol.rows[0].col_id]
    );
    
    res.status(201).json(newCol.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/v1/cols/:project_id", authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;

    const columns = await pool.query(
      `SELECT * FROM cols WHERE project_id = $1`,
      [project_id]
    );
    res.json(columns.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.put("/api/v1/cols", authenticateToken, async (req, res) => {
  try {
    const { column_id, project_id, name, max, size, next_col } = req.body;
    const email = req.user.email;

    // Check if user is in the project
    const user_list = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );

    if (user_list.rows[0].user_emails.includes(email)) {
      // Get old column
      const oldColumn = await pool.query(
        `SELECT * FROM cols WHERE project_id = $1 AND col_id = $2`,
        [project_id, column_id]
      );

      if (oldColumn.rowCount === 0) {
        res.status(404).json("Column not found");
        return;
      }

      if (oldColumn.rows[0].name !== name) {
        // Update tickets in column
        await pool.query(
          `UPDATE tickets SET column_name = $1 WHERE column_name = $2 AND project_id = $3 RETURNING *`,
          [name, oldColumn.rows[0].name, project_id]
        );
      }

      const updatedColumn = await pool.query(
        `UPDATE cols SET name = $1, max = $2, size = $3, next_col = $4 WHERE col_id = $5 RETURNING *`,
        [name, max, size, next_col, column_id]
      );
      res.status(200).json(updatedColumn.rows[0]);
    } else {
      res.status(401).json("User is not in the project");
    }
  } catch (err) {
    console.error(err.message);
  }
});

// delete a column
app.delete("/api/v1/cols", authenticateToken, async (req, res) => {
  try {
    const { column_id, project_id } = req.body;
    const email = req.user.email;

    // Check if user is in the project
    const user_list = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );

    if (user_list.rows[0].user_emails.includes(email)) {
      try {
        const currCol = await pool.query(
          `SELECT * FROM cols WHERE project_id = $1 AND col_id = $2`,
          [project_id, column_id]
        );

        if (currCol.rowCount === 0) {
          res.status(404).json("Column not found");
          return;
        }

        // Move tickets in column to To Do column
        await pool.query(
          `UPDATE tickets SET column_name = 'To Do' WHERE column_name = $1 AND project_id = $2`,
          [currCol.rows[0].name, project_id]
        );

        const prevCol = await pool.query(
          `SELECT * FROM cols WHERE project_id = $1 AND next_col = $2`,
          [project_id, column_id]
        );

        if (prevCol.rowCount > 0) {
          await pool.query(
            `UPDATE cols SET next_col = $1 WHERE col_id = $2`,
            [currCol.rows[0].next_col, prevCol.rows[0].col_id]
          );
        }

        await pool.query(
          `DELETE FROM cols WHERE col_id = $1`,
          [column_id]
        );
        res.status(200).json("Column was deleted!");
      } catch (err) {
        console.log(err.message);
      }
    } else {
      res.status(401).json("User is not in the project");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/api/v1/roles", authenticateToken, async (req, res) => {
  const { roles, project_id } = req.body;
  const email = req.user.email;

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
});

app.get("/api/v1/roles/:project_id", authenticateToken, async (req, res) => {
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
});

app.get("/api/v1/roles/users_permissions/:project_id", authenticateToken, async (req, res) => {
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
});

app.put("/api/v1/roles", authenticateToken, async (req, res) => {
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
});

app.post("/api/v1/change_role", authenticateToken, async (req, res) => {
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
});

// delete a role
app.delete("/api/v1/roles", authenticateToken, async (req, res) => {
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
});

app.post("/api/v1/forgot_password", async (req, res) => {
  try {
    const tableName = "user_info";
    const { recipient_email } = req.body;

    // Generate password reset token
    const resetToken = jwt.sign({ recipient_email, exp: Math.floor(Date.now() / 1000) + 3600 }, process.env.JWT_SECRET);
    await pool.query(
      `UPDATE ${tableName} SET token = $1 WHERE email = $2`,
      [resetToken, recipient_email]
    );
    // Token expires in 1 hour

    // Code to send email
    sendRecoveryEmail(req.body)
    .then((response) => res.status(200).json({message: response.message, resetToken: resetToken}))
    .catch((err) => res.status(500).send(err.message));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/api/v1/invite", authenticateToken, async (req, res) => {
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
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/api/v1/join_project/:token", async (req, res) => {
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
    res.status(500).send("Server error");
  }
});

app.listen(process.env.DB_PORT, () => {
  console.log('Server has started on port ' + process.env.DB_PORT);
});


//FUNCTIONS//

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Auth Error" })
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie('token');
    res.status(401).json({ message: "Auth Error" })
  }
}

function sendRecoveryEmail({ recipient_email, otp }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_EMAIL_PASSWORD,
      },
    });

    // Template for email
    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: "Trakr Password Recovery",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>Trakr Password Recovery</title>
  

</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Trakr. Use the following code to complete your password recovery procedure. Code is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Trakr</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Trakr</p>
      <p>${process.env.MY_EMAIL}</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}

function sendInviteEmail({recipient_email, project_id}) {
  return new Promise(async (resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_EMAIL_PASSWORD,
      },
    });

    // Get project name
    const project = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );

    if (project.rowCount === 0) {
      return reject({ message: `Project not found` });
    }

    const projectName = project.rows[0].name;

    const emailToken = jwt.sign(
      {
        project_id, email: recipient_email 
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    const url = process.env.NODE_ENV === 'production'
      ? `/api/v1/join_project/${emailToken}`
      : `http://localhost:5000/api/v1/join_project/${emailToken}`;

    // Template for email
    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: "Trakr Project Invite",
      html: `Please click this link to join the project ${projectName}: <a href="${url}">${url}</a>`
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}