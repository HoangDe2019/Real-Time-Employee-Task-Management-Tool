import express from 'express';
import { sendMail } from '../utils/mailer.js';

function randomSixDigit() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createOwnerRouter(repo) {
  const router = express.Router();

  router.post('/CreateNewAccessCode', async (req, res) => {
    console.log('[API] CreateNewAccessCode', req.body);
    const { phoneNumber } = req.body || {};
    const code = randomSixDigit();
    repo.savePhoneCode(phoneNumber, code);
    // TODO: integrate Twilio or SMS provider
    return res.json({ code });
  });

  router.post('/ValidateAccessCode', async (req, res) => {
    console.log('[API] ValidateAccessCode', req.body);
    const { phoneNumber, accessCode } = req.body || {};
    const stored = repo.getPhoneCode(phoneNumber);
    const success = stored === accessCode;
    if (success) repo.clearPhoneCode(phoneNumber);
    return res.json({ success });
  });

  router.get('/ListEmployees', async (_req, res) => {
    console.log('[API] ListEmployees');
    return res.json(repo.listEmployees());
  });

  router.post('/GetEmployee', async (req, res) => {
    console.log('[API] GetEmployee', req.body);
    const { employeeId } = req.body || {};
    const employee = repo.getEmployee(employeeId);
    return res.json(employee || {});
  });

  router.post('/CreateEmployee', async (req, res) => {
    console.log('[API] CreateEmployee', req.body);
    const { name, email, department } = req.body || {};
    const employeeId = await repo.createEmployee({ name, email, department });
    // Optionally send a welcome email if email provided
    if (email) {
      try {
        await sendMail({
          to: email,
          subject: `Welcome to ${department || 'the team'}`,
          text: `Hi ${name || ''}, your employee record has been created.`
        });
      } catch (e) {
        console.error('[Mail] Failed to send welcome email:', e);
      }
    }
    return res.json({ success: true, employeeId });
  });

  router.post('/DeleteEmployee', async (req, res) => {
    console.log('[API] DeleteEmployee', req.body);
    const { employeeId } = req.body || {};
    repo.deleteEmployee(employeeId);
    return res.json({ success: true });
  });

  // Generic email sender
  router.post('/SendMail', async (req, res) => {
    try {
      const { to, subject, text, html, from } = req.body || {};
      if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: 'to, subject and text or html are required' });
      }
      const result = await sendMail({ to, subject, text, html, from });
      return res.json({ success: true, result });
    } catch (error) {
      console.error('[API] SendMail error:', error);
      return res.status(500).json({ success: false, error: 'Failed to send mail' });
    }
  });

  return router;
}