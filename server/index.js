const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv');

const allowedOrigins = ['http://localhost:3000'];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

//middleware
app.use(cors(corsOptions));
app.use(express.json()); //req.body
app.use(cookieParser());

//ROUTES//

// create a ticket
app.post("/tickets", authenticateToken, async (req, res) => {
  try {
    const tableName = "tickets";
    const { name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project } = req.body;
    const username = req.user.email;

    const newTicket = await pool.query(
      `INSERT INTO ${tableName} (name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project, username]
    );

    res.json(newTicket.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// get all tickets for a user
app.get("/tickets", authenticateToken, async (req, res) => {
  try {
    const username = req.user.email;
    const tableName = "tickets";
    const allTickets = await pool.query(
      `SELECT * FROM ${tableName} WHERE username = $1 ORDER BY epic ASC`,
      [username]
    );
    res.json(allTickets.rows);
  } catch (err) {
    console.error(err.message);
  }
});


// get a ticket
app.get("/tickets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.email;
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
app.put("/tickets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.email;
    const tableName = "tickets";
    const { name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project } = req.body;
    const updateTicket = await pool.query(
      `UPDATE ${tableName} SET name = $1, type = $2, epic = $3, description = $4, blocks = $5, blocked_by = $6, points = $7, assignee = $8, sprint = $9, column_name = $10, pull_request = $11, project = $12 WHERE (ticket_id = $13 AND username = $14) RETURNING *`,
      [name, type, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project, id, username]
    );

    res.json(updateTicket.rows[0]);
    } catch (err) {
    console.error(err.message);
  }
});

// delete a ticket
app.delete("/tickets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.email;
    const tableName = "tickets";
    await pool.query(`DELETE FROM ${tableName} WHERE (ticket_id = $1 AND username = $2)`, [
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
        const user = { email: email, name: checkUser.rows[0].name };
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

app.get("/user_info/logout", (req, res) => {
  res.clearCookie('token');
  res.status(200).json("Logged out");
});

app.get("/user_info/verify", authenticateToken, (req, res) => {
  res.status(200).json("Valid token");
});

app.get("/user_info", authenticateToken, async (req, res) => {
  res.status(200).json({email: req.user.email, name: req.user.name});
});

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

app.listen(process.env.DB_PORT, () => {
  console.log('Server has started on port ' + process.env.DB_PORT);
});