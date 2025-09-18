import express from 'express';

function randomSixDigit() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createEmployeeRouter(repo) {
  const router = express.Router();

  // Employee login via email
  router.post('/LoginEmail', async (req, res) => {
    try {
      console.log('[API] Employee LoginEmail', req.body);
      const { email } = req.body || {};
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Check if employee exists
      let employee = null;
      if (repo.getEmployeeByEmail && repo.getEmployeeByEmail.constructor.name === 'AsyncFunction') {
        employee = await repo.getEmployeeByEmail(email);
      } else if (repo.getEmployeeByEmail) {
        employee = repo.getEmployeeByEmail(email);
      } else {
        // Fallback: check all employees for matching email
        let employees;
        if (repo.listEmployees.constructor.name === 'AsyncFunction') {
          employees = await repo.listEmployees();
        } else {
          employees = repo.listEmployees();
        }
        employee = employees.find(emp => emp.email === email);
      }
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      const code = randomSixDigit();
      
      // Save code temporarily (could use a separate collection for employee codes)
      const emailKey = `employee_${email}`;
      if (repo.savePhoneCode.constructor.name === 'AsyncFunction') {
        await repo.savePhoneCode(emailKey, code);
      } else {
        repo.savePhoneCode(emailKey, code);
      }
      
      // TODO: Send email with access code
      console.log(`Email would be sent to ${email}: Your access code is ${code}`);
      
      return res.json({ code }); // Remove this in production
    } catch (error) {
      console.error('[API] Employee LoginEmail error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Validate employee access code
  router.post('/ValidateAccessCode', async (req, res) => {
    try {
      console.log('[API] Employee ValidateAccessCode', req.body);
      const { email, accessCode } = req.body || {};
      
      if (!email || !accessCode) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and access code are required' 
        });
      }
      
      const emailKey = `employee_${email}`;
      let stored;
      if (repo.getPhoneCode.constructor.name === 'AsyncFunction') {
        stored = await repo.getPhoneCode(emailKey);
      } else {
        stored = repo.getPhoneCode(emailKey);
      }
      
      const success = stored === accessCode;
      
      if (success) {
        // Clear the code after successful validation
        if (repo.clearPhoneCode.constructor.name === 'AsyncFunction') {
          await repo.clearPhoneCode(emailKey);
        } else {
          repo.clearPhoneCode(emailKey);
        }
        
        // Get employee data to return
        let employee = null;
        if (repo.getEmployeeByEmail && repo.getEmployeeByEmail.constructor.name === 'AsyncFunction') {
          employee = await repo.getEmployeeByEmail(email);
        } else if (repo.getEmployeeByEmail) {
          employee = repo.getEmployeeByEmail(email);
        } else {
          // Fallback: check all employees for matching email
          let employees;
          if (repo.listEmployees.constructor.name === 'AsyncFunction') {
            employees = await repo.listEmployees();
          } else {
            employees = repo.listEmployees();
          }
          employee = employees.find(emp => emp.email === email);
        }
        
        return res.json({ 
          success: true, 
          employee: employee ? {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            department: employee.department
          } : null
        });
      }
      
      return res.json({ success: false });
    } catch (error) {
      console.error('[API] Employee ValidateAccessCode error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Get employee profile
  router.get('/Profile/:employeeId', async (req, res) => {
    try {
      console.log('[API] Employee Profile', req.params);
      const { employeeId } = req.params;
      
      if (!employeeId) {
        return res.status(400).json({ error: 'Employee ID is required' });
      }
      
      let employee;
      if (repo.getEmployee.constructor.name === 'AsyncFunction') {
        employee = await repo.getEmployee(employeeId);
      } else {
        employee = repo.getEmployee(employeeId);
      }
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      return res.json(employee);
    } catch (error) {
      console.error('[API] Employee Profile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update employee profile
  router.put('/Profile/:employeeId', async (req, res) => {
    try {
      console.log('[API] Update Employee Profile', req.params, req.body);
      const { employeeId } = req.params;
      const updates = req.body;
      
      if (!employeeId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Employee ID is required' 
        });
      }
      
      // Remove sensitive fields that employees shouldn't be able to update
      const allowedUpdates = {
        name: updates.name,
        // email updates might need approval workflow
        // department updates should be manager-only
      };
      
      // Remove undefined values
      Object.keys(allowedUpdates).forEach(key => {
        if (allowedUpdates[key] === undefined) {
          delete allowedUpdates[key];
        }
      });
      
      let result = false;
      if (repo.updateEmployee && repo.updateEmployee.constructor.name === 'AsyncFunction') {
        result = await repo.updateEmployee(employeeId, allowedUpdates);
      } else if (repo.updateEmployee) {
        result = repo.updateEmployee(employeeId, allowedUpdates);
      }
      
      return res.json({ success: result });
    } catch (error) {
      console.error('[API] Update Employee Profile error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Get employee tasks
  router.get('/Tasks/:employeeId', async (req, res) => {
    try {
      console.log('[API] Employee Tasks', req.params);
      const { employeeId } = req.params;
      
      if (!employeeId) {
        return res.status(400).json({ error: 'Employee ID is required' });
      }
      
      let tasks = [];
      if (repo.getTasksByEmployee && repo.getTasksByEmployee.constructor.name === 'AsyncFunction') {
        tasks = await repo.getTasksByEmployee(employeeId);
      } else if (repo.getTasksByEmployee) {
        tasks = repo.getTasksByEmployee(employeeId);
      }
      
      return res.json(tasks);
    } catch (error) {
      console.error('[API] Employee Tasks error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update task status
  router.put('/Task/:taskId', async (req, res) => {
    try {
      console.log('[API] Update Task Status', req.params, req.body);
      const { taskId } = req.params;
      const { status, employeeId } = req.body;
      
      if (!taskId || !status || !employeeId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Task ID, status, and employee ID are required' 
        });
      }
      
      // Only allow certain status transitions for employees
      const allowedStatuses = ['in_progress', 'completed', 'blocked'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid status' 
        });
      }
      
      let result = false;
      if (repo.updateTask && repo.updateTask.constructor.name === 'AsyncFunction') {
        result = await repo.updateTask(taskId, { 
          status,
          updatedBy: employeeId,
          statusUpdatedAt: new Date().toISOString()
        });
      } else if (repo.updateTask) {
        result = repo.updateTask(taskId, { 
          status,
          updatedBy: employeeId,
          statusUpdatedAt: new Date().toISOString()
        });
      }
      
      return res.json({ success: result });
    } catch (error) {
      console.error('[API] Update Task Status error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
}