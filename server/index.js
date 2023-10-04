const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
require('dotenv');

//middleware
app.use(cors());
app.use(express.json()); //req.body


//ROUTES//

// create a ticket
app.post("/tickets", async (req, res) => {
  try {
    const tableName = "tickets";
    const { name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project, username } = req.body;

    const newTicket = await pool.query(
      `INSERT INTO ${tableName} (name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project, username]
    );

    res.json(newTicket.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// get all tickets for a user
app.get("/:username/tickets", async (req, res) => {
  try {
    const { username } = req.params;
    const tableName = "tickets";
    const allTickets = await pool.query(
      `SELECT * FROM ${tableName} WHERE username = $1`,
      [username]
    );
    res.json(allTickets.rows);
  } catch (err) {
    console.error(err.message);
  }
});


// get a ticket
app.get("/:username/tickets/:id", async (req, res) => {
  try {
    const { id, username } = req.params;
    const tableName = "tickets";
    const ticket = await pool.query(`SELECT * FROM ${tableName} WHERE (ticket_id = $1 AND username = $2)`, [
      id, username
    ]);
    res.json(ticket.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// update a ticket
app.put("/:username/tickets/:id", async (req, res) => {
  try {
    const { id, username } = req.params;
    const tableName = "tickets";
    const { name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project } = req.body;
    const updateTicket = await pool.query(
      `UPDATE ${tableName} SET name = $1, type = $2, epic = $3, description = $4, blocks = $5, blocked_by = $6, points = $7, assignee = $8, sprint = $9, column_name = $10, project = $11 WHERE (ticket_id = $12 AND username = $13) RETURNING *`,
      [name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project, id, username]
    );

    res.json(updateTicket.rows[0]);
    } catch (err) {
    console.error(err.message);
  }
});

// delete a ticket
app.delete("/:username/tickets/:id", async (req, res) => {
  try {
    const { id, username } = req.params;
    const tableName = "tickets";
    const deleteTicket = await pool.query(`DELETE FROM ${tableName} WHERE (ticket_id = $1 AND username = $2)`, [
      id, username
    ]);
    res.json("Ticket was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});

// create a user
app.post("/user_info/create", async (req, res) => {
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

// Check if username password is in the db
app.post("/user_info/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkUser = await pool.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );

    if (checkUser.rowCount > 0) {
      const matching = await bcrypt.compare(password, checkUser.rows[0].password);
      if (matching) {
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
});

app.listen(process.env.DB_PORT, () => {
  console.log('Server has started on port ' + process.env.DB_PORT);
});