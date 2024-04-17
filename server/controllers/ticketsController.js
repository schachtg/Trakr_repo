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

module.exports = { createTicket };