import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export function EmployeeDashboard({ api }) {
  console.log('[EmployeeDashboard] render');
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', department: '' });
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    console.log('[EmployeeDashboard] refresh start');
    const list = await api.listEmployees();
    console.log('[EmployeeDashboard] refresh result', list);
    setEmployees(list || []);
  };

  useEffect(() => {
    console.log('[EmployeeDashboard] useEffect -> refresh');
    refresh();
  }, []);

  const create = async () => {
    console.log('[EmployeeDashboard] create start', form);
    await api.createEmployee(form);
    setForm({ name: '', email: '', department: '' });
    refresh();
  };

  const remove = async (employeeId) => {
    console.log('[EmployeeDashboard] remove start', employeeId);
    await api.deleteEmployee({ employeeId });
    refresh();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Manage Employee</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create Employee</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.name}</TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell><Chip label="Active" color="success" size="small" variant="outlined" /></TableCell>
                <TableCell align="right">
                  <IconButton size="small"><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => remove(e.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Employee Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { create(); setOpen(false); }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


