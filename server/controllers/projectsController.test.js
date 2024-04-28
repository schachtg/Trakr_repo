const controller = require('./projectsController.js');
const pool = require('../db');

// Mocking the dependencies
jest.mock('../db', () => ({
    query: jest.fn(),
    connect: jest.fn(),
}));

describe('createProject function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should create a new project and return it', async () => {
      const req = {
        body: { name: 'New Project' },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user info
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
      });
  
      // Mocking the pool.query method for creating the project
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 1, name: 'New Project', user_emails: ['test@example.com'], curr_sprint: 1 }],
      });
  
      await controller.createProject(req, res);
  
      expect(pool.query).toHaveBeenCalledTimes(2);
  
      // Check if SELECT FROM user_info query was called with correct values
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM user_info WHERE email = $1');
      expect(pool.query.mock.calls[0][1]).toEqual(['test@example.com']);
  
      // Check if INSERT INTO projects query was called with correct values
      expect(pool.query.mock.calls[1][0]).toContain('INSERT INTO projects (name, user_emails, curr_sprint) VALUES');
      expect(pool.query.mock.calls[1][1]).toEqual(['New Project', ['test@example.com'], 1]);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'New Project', user_emails: ['test@example.com'], curr_sprint: 1 });
    });
  
    it('should return "User not found" when user is not found', async () => {
      const req = {
        body: { name: 'New Project' },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for user info
      pool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
  
      await controller.createProject(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM user_info WHERE email = $1', ['test@example.com']);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('User not found');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        body: { name: 'New Project' },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.createProject(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM user_info WHERE email = $1', ['test@example.com']);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
});

describe('getUsersProjects function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return projects associated with the user', async () => {
      const req = {
        user: { email: 'test@example.com' },
      };
  
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      // Mocking the pool.query method for fetching projects
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Project 1', user_emails: ['test@example.com'] }, { id: 2, name: 'Project 2', user_emails: ['test@example.com'] }],
      });
  
      await controller.getUsersProjects(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE $1 = ANY(user_emails)', ['test@example.com']);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Project 1', user_emails: ['test@example.com'] }, { id: 2, name: 'Project 2', user_emails: ['test@example.com'] }]);
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        user: { email: 'test@example.com' },
      };
  
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test Error'));
  
      await controller.getUsersProjects(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE $1 = ANY(user_emails)', ['test@example.com']);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test Error' });
    });
});

describe('getProjectById function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return project with the specified ID associated with the user', async () => {
      const req = {
        user: { email: 'test@example.com' },
        params: { project_id: 1 },
      };
  
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      // Mocking the pool.query method for fetching project
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 1, name: 'Project 1', user_emails: ['test@example.com'] }],
      });
  
      await controller.getProjectById(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE $1 = ANY(user_emails) AND project_id = $2', ['test@example.com', 1]);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Project 1', user_emails: ['test@example.com'] });
    });
  
    it('should return "Project not found" if project with specified ID is not associated with the user', async () => {
      const req = {
        user: { email: 'test@example.com' },
        params: { project_id: 2 },
      };
  
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      // Mocking the pool.query method for fetching project
      pool.query.mockResolvedValueOnce({
        rowCount: 0,
      });
  
      await controller.getProjectById(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE $1 = ANY(user_emails) AND project_id = $2', ['test@example.com', 2]);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('Project not found');
    });
  
    it('should handle errors gracefully', async () => {
      const req = {
        user: { email: 'test@example.com' },
        params: { project_id: 1 },
      };
  
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      // Mocking an error
      pool.query.mockRejectedValueOnce(new Error('Test error'));
  
      await controller.getProjectById(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE $1 = ANY(user_emails) AND project_id = $2', ['test@example.com', 1]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
    });
});

describe('deleteProject function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should delete the project and return success message', async () => {
      const req = {
        params: { project_id: 1 },
        user: { email: 'test@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mocking the pool.query method for fetching project
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'] }],
      });
  
      // Mocking the pool.connect method
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValueOnce(mockClient);
  
      await controller.deleteProject(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledTimes(7);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM tickets WHERE project_id = $1', [1]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM epics WHERE project_id = $1', [1]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM cols WHERE project_id = $1', [1]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM roles WHERE project_id = $1', [1]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM projects WHERE project_id = $1', [1]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith("Project was deleted!");
    });

    it('should return "User not found" when user is not found', async () => {
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
      
          await controller.deleteProject(req, res);
      
          expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
          expect(res.status).toHaveBeenCalledWith(401);
          expect(res.json).toHaveBeenCalledWith('User is not in the project');
    });
    
    it('should handle errors gracefully', async () => {
        const req = {
            body: { name: 'New Project' },
            user: { email: 'test@example.com' },
          };
      
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };
      
          // Mocking the pool.query method for user info
          pool.query.mockResolvedValueOnce({
              rows: [{ user_emails: [] }],
          });
  
          pool.query.mockResolvedValueOnce({
              rows: [{ user_emails: [] }],
          });
      
          await controller.deleteProject(req, res);
      
          expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('updateSprint function', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should update the sprint and handle tickets accordingly', async () => {
        jest.resetAllMocks();
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
        rows: [{ user_emails: ['test@example.com'], curr_sprint: 1 }],
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'], curr_sprint: 1 }],
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'], curr_sprint: 1 }],
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'], curr_sprint: 1 }],
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'], curr_sprint: 1 }],
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ user_emails: ['test@example.com'], curr_sprint: 1 }],
      });
  
      await controller.updateSprint(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith('Next sprint was set!');
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
        rows: [{ user_emails: [], curr_sprint: 1 }],
      });
  
      await controller.updateSprint(req, res);
  
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
      const errorMessage = 'Test error';
      pool.query.mockImplementation(() => { throw new Error(errorMessage)});
  
      await controller.updateSprint(req, res);
  
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
});

// Test updates