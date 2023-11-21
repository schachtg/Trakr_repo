const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv');

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
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

app.patch("/reset_password", async (req, res) => {
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

app.get("/user_info/logout", (req, res) => {
  res.clearCookie('token');
  res.status(200).json("Logged out");
});

app.get("/user_info/verify", authenticateToken, (req, res) => {
  res.status(200).json("Valid token");
});

app.put("/user_info/open_project", authenticateToken, async (req, res) => {
  try {
    const { open_project } = req.body;
    const email = req.user.email;
    const tableName = "user_info";

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

app.get("/user_info", authenticateToken, async (req, res) => {
  
  const { email } = req.user;
  const tableName = "user_info";

  // Use email to get user's data
  const userData = await pool.query(
    `SELECT * FROM ${tableName} WHERE email = $1`,
    [email]
  );

  res.status(200).json({email: req.user.email, name: userData.rows[0].name, id: userData.rows[0].user_id, open_project: userData.rows[0].open_project});
});

// Create a project
app.post("/projects", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const email = req.user.email;

    // Get user's id
    const checkUser = await pool.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );
    if(checkUser.rowCount === 0) {
      res.status(404).json("User not found");
      return;
    }
    const user_id = checkUser.rows[0].user_id;

    // Create a new project (name can be duplicated but will have different id)
    const newProject = await pool.query(
      `INSERT INTO projects (name, user_ids) VALUES ($1, $2) RETURNING *`,
      [name, [user_id]]
    );
    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    res.status(404).json("An error occured");
  }

  return;
});

app.get("/projects", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;

    // Get user's id
    const checkUser = await pool.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );
    if(checkUser.rowCount === 0) {
      res.status(404).json("User not found");
      return;
    }
    const user_id = checkUser.rows[0].user_id;

    const allProjects = await pool.query(
      `SELECT * FROM projects WHERE user_ids = $1`,
      [[user_id]]
    );
    res.json(allProjects.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// delete a project
app.delete("/projects/:project_id", authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const email = req.user.email;

    // Get user's id
    const checkUser = await pool.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );
    if(checkUser.rowCount === 0) {
      res.status(404).json("User not found");
      return;
    }
    const user_id = checkUser.rows[0].user_id;

    // Check if user is in the project
    const user_list = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );
    if (user_list.rows[0].user_ids.includes(user_id)) {
      try {
        await pool.query(
          `DELETE FROM projects WHERE project_id = $1`,
          [project_id]
        );
        res.status(200).json("Project was deleted!");
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

app.post("/cols/add_single", authenticateToken, async (req, res) => {
  const { name, max, project_id } = req.body;
  const size = 0;
  const location = 0
  const email = req.user.email;

  try {
    const newCol = await pool.query(
      `INSERT INTO cols (name, max, project_id, size, location) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, max, project_id, size, location]
    );
    
    res.status(201).json(newCol.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/cols", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const { project_id } = req.body;

    const columns = await pool.query(
      `SELECT * FROM cols WHERE project_id = $1`,
      [project_id]
    );
    res.json(columns.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.put("/cols", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const { column_id, name, max, size, location } = req.body;

    const updatedColumn = await pool.query(
      `UPDATE cols SET (name, max, size, location) VALUES ($1, $2, $3, $4) RETURNING * WHERE column_id = $5`,
      [name, max, size, location, column_id]
    );
    res.status(200).json(updatedColumn.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});

// delete a column
app.delete("/cols", authenticateToken, async (req, res) => {
  try {
    const { column_id, project_id } = req.body;
    const email = req.user.email;

    // Get user's id
    const checkUser = await pool.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );
    if(checkUser.rowCount === 0) {
      res.status(404).json("User not found");
      return;
    }
    const user_id = checkUser.rows[0].user_id;

    // Check if user is in the project
    const user_list = await pool.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [project_id]
    );
    if (user_list.rows[0].user_ids.includes(user_id)) {
      try {
        await pool.query(
          `DELETE FROM cols WHERE column_id = $1`,
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

app.post("/forgot_password", async (req, res) => {
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