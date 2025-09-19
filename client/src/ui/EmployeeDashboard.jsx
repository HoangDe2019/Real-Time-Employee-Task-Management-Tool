import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export function EmployeeDashboard({ api }) {
    console.log('[EmployeeDashboard] render');

    // State management
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', department: '' });
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // FIX 1: Handle API response structure and add error handling
    const refresh = async () => {
        try {
            console.log('[EmployeeDashboard] refresh start');
            setLoading(true);
            setError('');

            const response = await api.listEmployees();
            console.log('[EmployeeDashboard] refresh result', response);

            // Handle different API response structures
            let employeeList;
            if (Array.isArray(response)) {
                employeeList = response;
            } else if (response && Array.isArray(response.employees)) {
                employeeList = response.employees;
            } else if (response && response.success && Array.isArray(response.employees)) {
                employeeList = response.employees;
            } else {
                employeeList = [];
                console.warn('[EmployeeDashboard] Unexpected API response format:', response);
            }

            setEmployees(employeeList);
        } catch (err) {
            console.error('[EmployeeDashboard] refresh error:', err);
            setError('Failed to load employees');
            setEmployees([]); // Ensure employees is always an array
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[EmployeeDashboard] useEffect -> refresh');
        refresh();
    }, []);

    // FIX 2: Add validation and proper async handling
    const validateForm = () => {
        if (!form.name.trim()) {
            setError('Employee name is required');
            return false;
        }
        if (!form.email.trim()) {
            setError('Email address is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const create = async () => {
        try {
            console.log('[EmployeeDashboard] create start', form);
            setError('');

            if (!validateForm()) return;

            setLoading(true);
            const response = await api.createEmployee(form);

            // Check if creation was successful
            if (response && (response.success !== false)) {
                setForm({ name: '', email: '', department: '' });
                setSuccess('Employee created successfully');
                setOpen(false);
                await refresh();
            } else {
                setError(response?.error || 'Failed to create employee');
            }
        } catch (err) {
            console.error('[EmployeeDashboard] create error:', err);
            setError('Failed to create employee');
        } finally {
            setLoading(false);
        }
    };

    // FIX 3: Add confirmation dialog and error handling for delete
    const handleDeleteClick = (employee) => {
        setDeleteConfirm(employee);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            console.log('[EmployeeDashboard] delete start', deleteConfirm.id);
            setError('');
            setLoading(true);

            const response = await api.deleteEmployee({ employeeId: deleteConfirm.id });

            if (response && (response.success !== false)) {
                setSuccess('Employee deleted successfully');
                await refresh();
            } else {
                setError(response?.error || 'Failed to delete employee');
            }
        } catch (err) {
            console.error('[EmployeeDashboard] delete error:', err);
            setError('Failed to delete employee');
        } finally {
            setLoading(false);
            setDeleteConfirm(null);
        }
    };

    // FIX 4: Add edit functionality
    const handleEdit = (employee) => {
        setForm({
            name: employee.name || '',
            email: employee.email || '',
            department: employee.department || ''
        });
        setEditingId(employee.id);
        setOpen(true);
    };

    const update = async () => {
        try {
            console.log('[EmployeeDashboard] update start', editingId, form);
            setError('');

            if (!validateForm()) return;

            setLoading(true);
            const response = await api.updateEmployee(editingId, form);

            if (response && (response.success !== false)) {
                setForm({ name: '', email: '', department: '' });
                setEditingId(null);
                setSuccess('Employee updated successfully');
                setOpen(false);
                await refresh();
            } else {
                setError(response?.error || 'Failed to update employee');
            }
        } catch (err) {
            console.error('[EmployeeDashboard] update error:', err);
            setError('Failed to update employee');
        } finally {
            setLoading(false);
        }
    };

    const handleDialogClose = () => {
        setOpen(false);
        setForm({ name: '', email: '', department: '' });
        setEditingId(null);
        setError('');
    };

    const handleCreateOrUpdate = () => {
        if (editingId) {
            update();
        } else {
            create();
        }
    };

    return (
        <Box>
            {/* Success/Error Messages */}
            <Snackbar
                open={!!success}
                autoHideDuration={3000}
                onClose={() => setSuccess('')}
            >
                <Alert severity="success">{success}</Alert>
            </Snackbar>

            <Snackbar
                open={!!error}
                autoHideDuration={5000}
                onClose={() => setError('')}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Manage Employees</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    disabled={loading}
                >
                    Create Employee
                </Button>
            </Stack>

            {/* FIX 5: Add loading state and safe array rendering */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <CircularProgress size={24} />
                                    <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                                        Loading...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && Array.isArray(employees) && employees.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body2" color="textSecondary">
                                        No employees found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && Array.isArray(employees) && employees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>{employee.name || 'N/A'}</TableCell>
                                <TableCell>{employee.email || 'N/A'}</TableCell>
                                <TableCell>{employee.department || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={employee.isActive === false ? "Inactive" : "Active"}
                                        color={employee.isActive === false ? "default" : "success"}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEdit(employee)}
                                        disabled={loading}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteClick(employee)}
                                        disabled={loading}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    {editingId ? 'Edit Employee' : 'Create Employee'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Employee Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <TextField
                            label="Department"
                            value={form.department}
                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                            disabled={loading}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateOrUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                {editingId ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            editingId ? 'Update' : 'Create'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete employee "{deleteConfirm?.name}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}