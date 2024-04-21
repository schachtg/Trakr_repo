const pool = require('../db');

const createColumns = async (req, res) => {
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
};

const addSingleColumn = async (req, res) => {
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
};

const getColumnsInProject = async (req, res) => {
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
};

const updateColumn = async (req, res) => {
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
};

const deleteColumn = async (req, res) => {
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
};

module.exports = { createColumns, addSingleColumn, getColumnsInProject, updateColumn, deleteColumn };