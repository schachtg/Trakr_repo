const controller = require('./epicsController.js');
const pool = require('../db');

// Mocking the dependencies
jest.mock('../db', () => ({
    query: jest.fn(),
}));

describe('createEpic function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should create a new epic and return it', async () => {
      const req = {
        body: {
          name: 'New Epic',
          color: '#ff0000',
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
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'] }],
      });
  
      // Mocking the pool.query method for checking epic existence
      pool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
  
      // Mocking the pool.query method for creating the epic
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ /* Your expected epic object here */ }],
      });
  
      await controller.createEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(3);
  
      // Check if SELECT FROM projects query was called with correct values
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM projects WHERE project_id = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
  
      // Check if SELECT FROM epics query was called with correct values
      expect(pool.query.mock.calls[1][0]).toContain('SELECT * FROM epics WHERE name = $1 AND project_id = $2');
      expect(pool.query.mock.calls[1][1]).toEqual(['New Epic', 1]);
  
      // Check if INSERT INTO epics query was called with correct values
      expect(pool.query.mock.calls[2][0]).toContain('INSERT INTO epics (name, project_id, color) VALUES');
      expect(pool.query.mock.calls[2][1]).toEqual(['New Epic', 1, '#ff0000']);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ /* Your expected epic object here */ });
    });
  
    it('should return "User is not in the project" when user is not in the project', async () => {
      const req = {
        body: {
          name: 'New Epic',
          color: '#ff0000',
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
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: [] }],
      });
  
      await controller.createEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith('User is not in the project');
    });
  
    it('should return "Epic already exists" when epic with the same name already exists', async () => {
      const req = {
        body: {
          name: 'Existing Epic',
          color: '#ff0000',
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
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'] }],
      });
  
      // Mocking the pool.query method for checking epic existence
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
      });
  
      await controller.createEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(2);
  
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith('Epic already exists');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        body: {
          name: 'New Epic',
          color: '#ff0000',
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
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.createEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
});

describe('getEpicsInProject function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return the epics in the project', async () => {
      const req = {
        params: { project_id: 1 },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'] }],
      });
  
      // Mocking the pool.query method for fetching epics
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Epic 1', project_id: 1 }, { id: 2, name: 'Epic 2', project_id: 1 }],
      });
  
      await controller.getEpicsInProject(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(2);
  
      // Check if SELECT FROM projects query was called with correct values
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM projects WHERE project_id = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
  
      // Check if SELECT FROM epics query was called with correct values
      expect(pool.query.mock.calls[1][0]).toContain('SELECT * FROM epics WHERE project_id = $1');
      expect(pool.query.mock.calls[1][1]).toEqual([1]);
  
      expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Epic 1', project_id: 1 }, { id: 2, name: 'Epic 2', project_id: 1 }]);
    });
  
    it('should return "User is not in the project" when user is not in the project', async () => {
      const req = {
        params: { project_id: 1 },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: [] }],
      });
  
      await controller.getEpicsInProject(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith('User is not in the project');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        params: { project_id: 1 },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.getEpicsInProject(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
});

describe('updateEpic function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should update the epic and return it', async () => {
      const req = {
        body: {
          epic_id: 1,
          project_id: 1,
          name: 'Updated Epic',
          color: '#00ff00',
        },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'] }],
      });
  
      // Mocking the pool.query method for checking epic existence
      pool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
  
      // Mocking the pool.query method for updating the epic
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 1, name: 'Updated Epic', color: '#00ff00', project_id: 1 }],
      });
  
      await controller.updateEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(3);
  
      // Check if SELECT FROM projects query was called with correct values
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM projects WHERE project_id = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
  
      // Check if SELECT FROM epics query was called with correct values
      expect(pool.query.mock.calls[1][0]).toContain('SELECT * FROM epics WHERE name = $1 AND project_id = $2');
      expect(pool.query.mock.calls[1][1]).toEqual(['Updated Epic', 1]);
  
      // Check if UPDATE epics query was called with correct values
      expect(pool.query.mock.calls[2][0]).toContain('UPDATE epics SET name = $1, color = $2 WHERE epic_id = $3');
      expect(pool.query.mock.calls[2][1]).toEqual(['Updated Epic', '#00ff00', 1]);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Updated Epic', color: '#00ff00', project_id: 1 });
    });
  
    it('should return "User is not in the project" when user is not in the project', async () => {
      const req = {
        body: {
          epic_id: 1,
          project_id: 1,
          name: 'Updated Epic',
          color: '#00ff00',
        },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: [] }],
      });
  
      await controller.updateEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith('User is not in the project');
    });
  
    it('should return "Epic already exists" when an epic with the same name exists', async () => {
      const req = {
        body: {
          epic_id: 1,
          project_id: 1,
          name: 'Existing Epic',
          color: '#00ff00',
        },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'] }],
      });
  
      // Mocking the pool.query method for checking epic existence
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
      });
  
      await controller.updateEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(2);
  
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith('Epic already exists');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        body: {
          epic_id: 1,
          project_id: 1,
          name: 'Updated Epic',
          color: '#00ff00',
        },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.updateEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
});

describe('deleteEpic function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should delete the epic and return success message', async () => {
      const req = {
        body: { epic_id: 1, project_id: 1 },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'] }],
      });
  
      await controller.deleteEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(2);
  
      // Check if SELECT FROM projects query was called with correct values
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM projects WHERE project_id = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([1]);
  
      // Check if DELETE FROM epics query was called with correct values
      expect(pool.query.mock.calls[1][0]).toContain('DELETE FROM epics WHERE epic_id = $1');
      expect(pool.query.mock.calls[1][1]).toEqual([1]);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith('Epic was deleted!');
    });
  
    it('should return "User is not in the project" when user is not in the project', async () => {
      const req = {
        body: { epic_id: 1, project_id: 1 },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user list
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: [] }],
      });
  
      await controller.deleteEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith('User is not in the project');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        body: { epic_id: 1, project_id: 1 },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.deleteEpic(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
  });