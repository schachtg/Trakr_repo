const pool = require('../db');

const createEpic = async (req, res) => {
    const { name, color, project_id } = req.body;
    const email = req.user.email;
  
    try {
      // Check if user is in the project
      const user_list = await pool.query(
        `SELECT * FROM projects WHERE project_id = $1`,
        [project_id]
      );
    
      if (!user_list.rows[0].user_emails.includes(email)) {
        res.status(401).json("User is not in the project");
        return;
      }

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
        res.status(400).json("An error occured");
        return;
      }

      res.status(201).json(newEpic.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getEpicsInProject = async (req, res) => {
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
      res.status(500).json({ error: err.message });
    }
};

const updateEpic = async (req, res) => {
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
      res.status(500).json({ error: err.message });
    }
};

const deleteEpic = async (req, res) => {
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
      res.status(500).json({ error: err.message });
    }
};

module.exports = { createEpic, getEpicsInProject, updateEpic, deleteEpic };