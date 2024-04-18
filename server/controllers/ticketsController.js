const pool = require('../db');

const createTicket = async (req, res) => {
    try {
        const { name, priority, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project_id } = req.body;
        const username = req.user.email;
    
        const newTicket = await pool.query(
          `INSERT INTO tickets (name, priority, epic, description, blocks, blocked_by, points, assignee, sprint, column_name, pull_request, project_id, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
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
    
        res.status(200).json(newTicket.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

const getTicketsByProjectId = async (req, res) => {
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
}

const getTicketById = async (req, res) => {
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
};

const updateTicket = async (req, res) => {
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
};

// delete a ticket
const deleteTicket = async (req, res) => {
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
};

module.exports = { createTicket, getTicketsByProjectId, getTicketById, updateTicket, deleteTicket };