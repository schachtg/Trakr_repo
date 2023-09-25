const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
require('dotenv');

//middleware
app.use(cors());
app.use(express.json()); //req.body


//ROUTES//

// create a ticket
app.post("/:username/tickets", async (req, res) => {
  try {
    const { username } = req.params;
    const tableName = username + "_tickets";
    const { name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project } = req.body;

    const newTicket = await pool.query(
      `INSERT INTO ${tableName} (name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project]
    );

    res.json(newTicket.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// get all tickets
app.get("/:username/tickets", async (req, res) => {
  try {
    const { username } = req.params;
    const tableName = username + "_tickets";
    const allTickets = await pool.query(`SELECT * FROM ${tableName}`);
    res.json(allTickets.rows);
  } catch (err) {
    console.error(err.message);
  }
});


// get a ticket
app.get("/:username/tickets/:id", async (req, res) => {
  try {
    const { id, username } = req.params;
    const ticket = await pool.query(`SELECT * FROM ${username}_tickets WHERE ticket_id = $1`, [
      id
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
    const { name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project } = req.body;
    const updateTicket = await pool.query(
      `UPDATE ${username}_tickets SET name = $1, type = $2, epic = $3, description = $4, blocks = $5, blocked_by = $6, points = $7, assignee = $8, sprint = $9, column_name = $10, project = $11 WHERE ticket_id = $12 RETURNING *`,
      [name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, project, id]
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
    const deleteTicket = await pool.query(`DELETE FROM ${username}_tickets WHERE ticket_id = $1`, [
      id
    ]);
    res.json("Ticket was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(process.env.DB_PORT, () => {
  console.log('Server has started on port ' + process.env.DB_PORT);
});