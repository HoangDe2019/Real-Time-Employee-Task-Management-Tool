import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, MenuItem } from '@mui/material';

export function AuthForm({ api, onSuccess }) {
  console.log('[AuthForm] render');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState('owner');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const requestCode = async () => {
    console.log('[AuthForm] requestCode start', { phone, role, email });
    if (cooldown > 0 || loading) return;
    setStatus('Requesting code...');
    setLoading(true);
    let response;
    if (role === 'owner') {
      response = await api.ownerCreateAccessCode({ phoneNumber: phone });
      setStatus('Code sent via SMS');
    } else {
      response = await api.employeeLoginEmail({ email });
      setStatus('Code sent to email');
    }
    console.log('[AuthForm] requestCode response', response);
    setLoading(false);
    setCooldown(30);
  };

  const validateCode = async () => {
    console.log('[AuthForm] validateCode start', { phone, email, code, role });
    if (loading) return;
    setStatus('Validating code...');
    setLoading(true);
    let result;
    if (role === 'owner') {
      result = await api.ownerValidateAccessCode({ phoneNumber: phone, accessCode: code });
    } else {
      result = await api.employeeValidateAccessCode({ email, accessCode: code });
    }
    console.log('[AuthForm] validateCode result', result);
    if (result?.success) {
      const identifier = role === 'owner' ? phone : (result.employee?.id || email);
      onSuccess(identifier, role);
    } else {
      setStatus('Invalid code');
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" textAlign="center">Sign In</Typography>
            <TextField select label="Role" size="small" value={role} onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </TextField>
            {role === 'owner' ? (
              <TextField label="Phone number" placeholder="Your Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            ) : (
              <TextField label="Email address" placeholder="Your Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            )}
            <Button variant="contained" onClick={requestCode} disabled={cooldown > 0 || loading}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : (loading ? 'Please wait...' : 'Next')}
            </Button>
            <Typography variant="body2" color="text.secondary" textAlign="center">passwordless authentication methods.</Typography>
            <Typography variant="subtitle1" textAlign="center">{role === 'owner' ? 'Phone verification' : 'Email verification'}</Typography>
            <TextField label="Access code" placeholder="Enter your code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button variant="contained" onClick={validateCode} disabled={loading}>Submit</Button>
            <Typography variant="body2" color="text.secondary">{status}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}


