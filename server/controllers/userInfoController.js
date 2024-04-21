const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendRecoveryEmail } = require('../utils/email');

const createUser = async (req, res) => {
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
};

const resetPassword = async (req, res) => {
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
};

const login = async (req, res) => {
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
};

const logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json("Logged out");
};

const verifyUser = async (req, res) => {
    res.status(200).json("Valid token");
};

const updateOpenProject = async (req, res) => {
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
};

const getUserInfo = async (req, res) => {
  
    const { email } = req.user;
    const tableName = "user_info";
  
    // Use email to get user's data
    const userData = await pool.query(
      `SELECT * FROM ${tableName} WHERE email = $1`,
      [email]
    );
  
    res.status(200).json({email: req.user.email, name: userData.rows[0].name, id: userData.rows[0].user_id, open_project: userData.rows[0].open_project});
};

const getUserInProjectInfo = async (req, res) => {
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
};

const forgotPasswordRecoveryEmail = async (req, res) => {
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
};

module.exports = { createUser, resetPassword, login, logout, verifyUser, updateOpenProject, getUserInfo, getUserInProjectInfo, forgotPasswordRecoveryEmail };