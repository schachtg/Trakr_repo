const controller = require('./ticketsController.js');
const pool = require('../db');

// Mocking the dependencies
jest.mock('../db', () => ({
    query: jest.fn(),
}));

describe('createTicket function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new ticket and return it', async () => {
        const req = {
        body: {
            name: 'Test Ticket',
            priority: 'High',
            epic: 'Test Epic',
            description: 'Test Description',
            blocks: null,
            blocked_by: null,
            points: 5,
            assignee: 'Test Assignee',
            sprint: 'Test Sprint',
            column_name: 'Test Column',
            pull_request: 'Test PR',
            project_id: 1,
        },
        user: {
            email: 'test@example.com',
        },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mocking the pool.query method
        pool.query.mockImplementationOnce(() => ({
            rows: [{ /* Your expected row object here */ }],
        }));

        // Mocking the pool.query method for columns
        pool.query.mockImplementationOnce(() => ({
            rows: [{ name: 'Test Column', size: 5, col_id: 1 }],
        }));

        await controller.createTicket(req, res);

        expect(pool.query).toHaveBeenCalledTimes(3);

        // Check if INSERT INTO tickets query was called with correct values
        expect(pool.query.mock.calls[0][0]).toContain('INSERT INTO tickets');
        expect(pool.query.mock.calls[0][1]).toEqual([
        'Test Ticket',
        'High',
        'Test Epic',
        'Test Description',
        null,
        null,
        5,
        'Test Assignee',
        'Test Sprint',
        'Test Column',
        'Test PR',
        1,
        'test@example.com',
        ]);

        // Check if SELECT FROM cols query was called with correct values
        expect(pool.query.mock.calls[1][0]).toContain('SELECT * FROM cols');
        expect(pool.query.mock.calls[1][1]).toEqual([1]);

        // Check if UPDATE cols query was called with correct values
        expect(pool.query.mock.calls[2][0]).toContain('UPDATE cols');
        expect(pool.query.mock.calls[2][1]).toEqual([6, 1]);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ /* Your expected response object here */ });
    });

    it('should handle errors gracefully', async () => {
        const req = { body: {}, user: { email: 'test@example.com' } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        // Mocking an error
        pool.query.mockRejectedValueOnce(new Error('Test error'));
    
        await controller.createTicket(req, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
});

describe('getTicketsByProjectId function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should make select from tickets with project id', async () => {
        const req = {
            params: {
                project_id: 1,
            },
            user: {
                email: 'test@example.com',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Mocking the pool.query method
        pool.query.mockImplementationOnce(() => ({
            rows: [{ /* Your expected row object here */ }],
        }));

        await controller.getTicketsByProjectId(req, res);

        expect(pool.query).toHaveBeenCalledTimes(1);

        // Check if INSERT INTO tickets query was called with correct values
        expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM tickets');
        expect(pool.query.mock.calls[0][1]).toEqual([1]);
    });

    it('should handle errors gracefully', async () => {
        const req = {
          params: { project_id: 1 },
        };
    
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        // Mocking an error
        pool.query.mockRejectedValueOnce(new Error('Test error'));
    
        await controller.getTicketsByProjectId(req, res);
    
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tickets WHERE project_id = $1 ORDER BY epic ASC', [1]);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
      });
});

describe('getTicketById function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return the ticket when it exists', async () => {
      const req = {
        params: { id: 1 },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ /* Your expected ticket object here */ }],
      });
  
      await controller.getTicketById(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tickets WHERE ticket_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ /* Your expected ticket object here */ });
    });
  
    it('should return "Ticket not found" when the ticket does not exist', async () => {
      const req = {
        params: { id: 1 },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method
      pool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
  
      await controller.getTicketById(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tickets WHERE ticket_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('Ticket not found');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        params: { id: 1 },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.getTicketById(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tickets WHERE ticket_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('Ticket not found');
    });
  });

  describe('updateTicket function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should update the ticket and return it', async () => {
      const req = {
        params: { id: 1 },
        body: {
          name: 'Updated Ticket',
          priority: 'Low',
          epic: 'Updated Epic',
          description: 'Updated Description',
          blocks: null,
          blocked_by: null,
          points: 3,
          assignee: 'Updated Assignee',
          sprint: 'Updated Sprint',
          column_name: 'Updated Column',
          pull_request: 'Updated PR',
          project_id: 1,
        },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ column_name: 'Old Column' }],
      });
  
      pool.query.mockResolvedValueOnce({
        rows: [{ name: 'Old Column', size: 5, col_id: 1 }, { name: 'Updated Column', size: 4, col_id: 2 }],
      });
  
      await controller.updateTicket(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(5);
  
      // Check if SELECT FROM tickets query was called with correct values
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM tickets WHERE ticket_id = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
  
      // Check if SELECT FROM cols query was called with correct values
      expect(pool.query.mock.calls[1][0]).toContain('SELECT * FROM cols WHERE project_id = $1');
      expect(pool.query.mock.calls[1][1]).toEqual([1]);
  
      // Check if UPDATE cols query was called with correct values
      expect(pool.query.mock.calls[4][0]).toContain('UPDATE tickets SET');
      expect(pool.query.mock.calls[4][1]).toEqual([
        'Updated Ticket',
        'Low',
        'Updated Epic',
        'Updated Description',
        null,
        null,
        3,
        'Updated Assignee',
        'Updated Sprint',
        'Updated Column',
        'Updated PR',
        1,
        1,
      ]);
    });
  
    it('should return "Ticket not found" when the ticket does not exist', async () => {
      const req = {
        params: { id: 1 },
        body: {},
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method
      pool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
  
      await controller.updateTicket(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tickets WHERE ticket_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('Ticket not found');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        params: { id: 1 },
        body: {},
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.updateTicket(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tickets WHERE ticket_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
  });

  describe('deleteTicket function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should delete the ticket and return success message', async () => {
      const req = {
        params: { id: 1 },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ column_name: 'Test Column', project_id: 1 }],
      });
  
      pool.query.mockResolvedValueOnce({
        rows: [{ name: 'Test Column', size: 5, col_id: 1 }],
      });
  
      await controller.deleteTicket(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(4);
  
      // Check if SELECT FROM tickets query was called with correct values
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM tickets WHERE ticket_id = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
  
      // Check if SELECT FROM cols query was called with correct values
      expect(pool.query.mock.calls[1][0]).toContain('SELECT * FROM cols WHERE project_id = $1');
      expect(pool.query.mock.calls[1][1]).toEqual([1]);
  
      // Check if UPDATE cols query was called with correct values
      expect(pool.query.mock.calls[2][0]).toContain('UPDATE cols SET size = $1 WHERE col_id = $2');
      expect(pool.query.mock.calls[2][1]).toEqual([4, 1]);
  
      // Check if DELETE FROM tickets query was called with correct values
      expect(pool.query.mock.calls[3][0]).toContain('DELETE FROM tickets WHERE ticket_id = $1');
      expect(pool.query.mock.calls[3][1]).toEqual([1]);
  
      expect(res.json).toHaveBeenCalledWith('Ticket was deleted!');
    });
  
    it('should return "Ticket not found" when the ticket does not exist', async () => {
      const req = {
        params: { id: 1 },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method
      pool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
  
      await controller.deleteTicket(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tickets WHERE ticket_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('Ticket not found');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        params: { id: 1 },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.deleteTicket(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tickets WHERE ticket_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
});