const pool = require('../db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv');

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
        ? `/api/v1/projects/join_project/${emailToken}`
        : `http://localhost:5000/api/v1/projects/join_project/${emailToken}`;
  
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

module.exports = { sendRecoveryEmail, sendInviteEmail };