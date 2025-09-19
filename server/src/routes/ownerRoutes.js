import express from 'express';
import { sendMail } from '../utils/mailer.js';

// Utility functions
function randomSixDigit() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function validatePhoneNumber(phoneNumber) {
    return phoneNumber && typeof phoneNumber === 'string' && phoneNumber.length >= 10;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email);
}

// Error handler middleware
function handleAsyncError(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export function createOwnerRouter(repo) {
    const router = express.Router();

    // FIXED: Proper async/await handling and validation
    router.post('/CreateNewAccessCode', handleAsyncError(async (req, res) => {
        console.log('[API] CreateNewAccessCode', req.body);
        const { phoneNumber } = req.body || {};

        // Input validation
        if (!validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({
                success: false,
                error: 'Valid phone number is required'
            });
        }

        try {
            const code = randomSixDigit();
            await repo.savePhoneCode(phoneNumber, code); // FIXED: Added await

            // TODO: integrate Twilio or SMS provider
            console.log(`[SMS] Would send code ${code} to ${phoneNumber}`);

            return res.json({
                success: true,
                message: 'Access code sent successfully',
                // Remove code from production - only for testing
                ...(process.env.NODE_ENV === 'development' && { code })
            });
        } catch (error) {
            console.error('[API] Error creating access code:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create access code'
            });
        }
    }));

    // FIXED: Removed artificial delay and improved error handling
    router.post('/ValidateAccessCode', handleAsyncError(async (req, res) => {
        console.log('[API] ValidateAccessCode', req.body);
        const { phoneNumber, accessCode } = req.body || {};

        // Input validation
        if (!validatePhoneNumber(phoneNumber) || !accessCode) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and access code are required'
            });
        }

        try {
            // REMOVED: Artificial delay - this was causing unnecessary latency
            const storedCode = await repo.getPhoneCode(phoneNumber);

            if (!storedCode) {
                return res.json({
                    success: false,
                    error: 'Access code not found or expired'
                });
            }

            const success = storedCode.toString() === accessCode.toString();
            console.log('[API] ValidateAccessCode success:', success);

            if (success) {
                await repo.clearPhoneCode(phoneNumber);
                return res.json({
                    success: true,
                    message: 'Access code validated successfully'
                });
            } else {
                return res.json({
                    success: false,
                    error: 'Invalid access code'
                });
            }
        } catch (error) {
            console.error('[API] Error validating access code:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }));

    // FIXED: Added proper async/await and error handling
    router.get('/ListEmployees', handleAsyncError(async (req, res) => {
        console.log('[API] ListEmployees');

        try {
            const { includeInactive = false } = req.query;
            const employees = await repo.listEmployees(includeInactive === 'true');

            return res.json({
                success: true,
                employees,
                count: employees.length
            });
        } catch (error) {
            console.error('[API] Error listing employees:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve employees'
            });
        }
    }));

    // FIXED: Added await and proper validation
    router.post('/GetEmployee', handleAsyncError(async (req, res) => {
        console.log('[API] GetEmployee', req.body);
        const { employeeId } = req.body || {};

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        try {
            const employee = await repo.getEmployee(employeeId);

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    error: 'Employee not found'
                });
            }

            return res.json({
                success: true,
                employee
            });
        } catch (error) {
            console.error('[API] Error getting employee:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve employee'
            });
        }
    }));

    // FIXED: Better validation and error handling
    router.post('/CreateEmployee', handleAsyncError(async (req, res) => {
        console.log('[API] CreateEmployee', req.body);
        const { name, email, department } = req.body || {};

        // Input validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Employee name is required'
            });
        }

        if (email && !validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Valid email address is required'
            });
        }

        try {
            const employeeData = await repo.createEmployee({
                name: name.trim(),
                email: email?.trim().toLowerCase(),
                department: department?.trim() || 'General'
            });

            // Send welcome email asynchronously (don't wait for it)
            if (email) {
                sendWelcomeEmail(email, name, department)
                    .catch(e => console.error('[Mail] Failed to send welcome email:', e));
            }

            return res.status(201).json({
                success: true,
                employee: employeeData,
                message: 'Employee created successfully'
            });
        } catch (error) {
            console.error('[API] Error creating employee:', error);

            // Handle specific errors
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Failed to create employee'
            });
        }
    }));

    // FIXED: Added await and proper error handling
    router.post('/DeleteEmployee', handleAsyncError(async (req, res) => {
        console.log('[API] DeleteEmployee', req.body);
        const { employeeId } = req.body || {};

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required'
            });
        }

        try {
            const result = await repo.deleteEmployee(employeeId);

            if (result) {
                return res.json({
                    success: true,
                    message: 'Employee deleted successfully'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Employee not found'
                });
            }
        } catch (error) {
            console.error('[API] Error deleting employee:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete employee'
            });
        }
    }));

    // IMPROVED: Better validation and error messages
    router.post('/SendMail', handleAsyncError(async (req, res) => {
        console.log('[API] SendMail', { to: req.body?.to, subject: req.body?.subject });

        const { to, subject, text, html, from } = req.body || {};

        // Enhanced validation
        if (!to || !subject || (!text && !html)) {
            return res.status(400).json({
                success: false,
                error: 'to, subject and either text or html are required'
            });
        }

        if (!validateEmail(to)) {
            return res.status(400).json({
                success: false,
                error: 'Valid recipient email address is required'
            });
        }

        try {
            const result = await sendMail({
                to: to.trim().toLowerCase(),
                subject: subject.trim(),
                text: text?.trim(),
                html: html?.trim(),
                from: from?.trim()
            });

            return res.json({
                success: true,
                message: 'Email sent successfully',
                result
            });
        } catch (error) {
            console.error('[API] SendMail error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send email'
            });
        }
    }));

    // NEW: Bulk operations endpoint
    router.post('/BulkCreateEmployees', handleAsyncError(async (req, res) => {
        console.log('[API] BulkCreateEmployees');
        const { employees } = req.body || {};

        if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Array of employees is required'
            });
        }

        if (employees.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 50 employees can be created at once'
            });
        }

        try {
            const results = [];
            const errors = [];

            for (const [index, emp] of employees.entries()) {
                try {
                    if (!emp.name?.trim()) {
                        throw new Error('Name is required');
                    }

                    const employeeData = await repo.createEmployee({
                        name: emp.name.trim(),
                        email: emp.email?.trim().toLowerCase(),
                        department: emp.department?.trim() || 'General'
                    });

                    results.push({ index, success: true, employee: employeeData });
                } catch (error) {
                    errors.push({ index, error: error.message, employee: emp });
                }
            }

            return res.json({
                success: true,
                created: results.length,
                failed: errors.length,
                results,
                errors
            });
        } catch (error) {
            console.error('[API] Error in bulk create:', error);
            return res.status(500).json({
                success: false,
                error: 'Bulk operation failed'
            });
        }
    }));

    // Error handling middleware
    router.use((error, req, res, next) => {
        console.error('[API] Unhandled error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    });

    return router;
}

// Helper function for sending welcome emails
async function sendWelcomeEmail(email, name, department) {
    try {
        await sendMail({
            to: email,
            subject: `Welcome to ${department || 'the team'}!`,
            text: `Hi ${name || 'there'},\n\nWelcome to ${department || 'our team'}! Your employee record has been created successfully.\n\nBest regards,\nThe Team`,
            html: `
        <h2>Welcome to ${department || 'the team'}!</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Welcome to ${department || 'our team'}! Your employee record has been created successfully.</p>
        <p>Best regards,<br>The Team</p>
      `
        });
    } catch (error) {
        throw error; // Re-throw to be caught by caller
    }
}