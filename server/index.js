const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

//middleware
app.use(cors());
app.use(express.json()); //req.body


//ROUTES//

// create a ticket
app.post("/tickets", async (req, res) => {
  try {
    const { description } = req.body;
    const newTicket = await pool.query(
      "INSERT INTO ticket (description) VALUES($1) RETURNING *",
      [description]
    );

    res.json(newTicket.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// get all tickets
app.get("/tickets", async (req, res) => {
  try {
    const allTickets = await pool.query("SELECT * FROM ticket");
    res.json(allTickets.rows);
  } catch (err) {
    console.error(err.message);
  }
});


// get a ticket
app.get("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await pool.query("SELECT * FROM ticket WHERE ticket_id = $1", [
      id
    ]);
    res.json(ticket.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// update a ticket
app.put("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const updateTicket = await pool.query(
      "UPDATE ticket SET description = $1 WHERE ticket_id = $2 RETURNING *",
      [description, id]
    );

    res.json(updateTicket.rows[0]);
    } catch (err) {
    console.error(err.message);
  }
});

// delete a ticket
app.delete("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTicket = await pool.query("DELETE FROM ticket WHERE ticket_id = $1", [
      id
    ]);
    res.json("Ticket was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server has started on port 5000');
});