import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { apiService } from '../../services/api';

const AvailabilityManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    date: null as Date | null,
    startTime: null as Date | null,
    endTime: null as Date | null,
    slotDuration: 30,
    maxAppointments: 1,
    timezone: 'UTC',
    isRecurring: false,
    recurrencePattern: 'WEEKLY',
    notes: '',
  });

  useEffect(() => {
    fetchAvailabilitySlots();
  }, []);

  const fetchAvailabilitySlots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getMyAvailability({
        page: 1,
        limit: 50,
      });
      
      if (response.success && response.data) {
        setAvailabilitySlots(response.data.data?.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load availability slots');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (slot?: any) => {
    if (slot) {
      setSelectedSlot(slot);
      setFormData({
        date: new Date(slot.date),
        startTime: new Date(`2000-01-01T${slot.startTime}`),
        endTime: new Date(`2000-01-01T${slot.endTime}`),
        slotDuration: slot.slotDuration,
        maxAppointments: slot.maxAppointments,
        timezone: slot.timezone || 'UTC',
        isRecurring: slot.isRecurring,
        recurrencePattern: slot.recurrencePattern || 'WEEKLY',
        notes: slot.notes || '',
      });
    } else {
      setSelectedSlot(null);
      setFormData({
        date: null,
        startTime: null,
        endTime: null,
        slotDuration: 30,
        maxAppointments: 1,
        timezone: 'UTC',
        isRecurring: false,
        recurrencePattern: 'WEEKLY',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSlot(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.date || !formData.startTime || !formData.endTime) {
        setError('Please fill in all required fields');
        return;
      }

      const availabilityData = {
        date: formData.date.toISOString().split('T')[0],
        startTime: formData.startTime.toTimeString().slice(0, 5),
        endTime: formData.endTime.toTimeString().slice(0, 5),
        slotDuration: formData.slotDuration,
        maxAppointments: formData.maxAppointments,
        timezone: formData.timezone,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
        notes: formData.notes,
      };

      if (selectedSlot) {
        // Update existing slot
        await apiService.updateAvailability(selectedSlot.id, availabilityData);
      } else {
        // Create new slot
        await apiService.createAvailability(availabilityData);
      }

      handleCloseDialog();
      fetchAvailabilitySlots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save availability slot');
    }
  };

  const handleDelete = async (slotId: string) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      try {
        await apiService.deleteAvailability(slotId);
        fetchAvailabilitySlots();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete availability slot');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'booked':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Availability Management
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Manage your availability slots and appointment scheduling
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Add Availability
        </Button>
      </Box>

      {/* Availability Slots Table */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        {availabilitySlots.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No availability slots found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first availability slot to start accepting appointments.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Add First Slot
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Bookings</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Recurring</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availabilitySlots.map((slot) => (
                  <TableRow key={slot.id} hover>
                    <TableCell>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {new Date(slot.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {slot.startTime} - {slot.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {slot.slotDuration} min
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={slot.status} 
                        color={getStatusColor(slot.status) as any}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {slot.currentAppointments || 0} / {slot.maxAppointments || 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={slot.isRecurring ? 'Yes' : 'No'} 
                        size="small"
                        sx={{ 
                          bgcolor: slot.isRecurring ? '#d1fae5' : '#f3f4f6',
                          color: slot.isRecurring ? '#059669' : '#6b7280',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenDialog(slot)}
                          sx={{ 
                            color: '#2563eb',
                            '&:hover': { bgcolor: '#dbeafe' }
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleDelete(slot.id)}
                          sx={{ 
                            color: '#ef4444',
                            '&:hover': { bgcolor: '#fee2e2' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
          {selectedSlot ? 'Edit Availability Slot' : 'Add Availability Slot'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                enableAccessibleFieldDOMStructure={false}
                slots={{
                  textField: (params) => <TextField {...params} fullWidth />
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <TimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={(newValue) => setFormData({ ...formData, startTime: newValue })}
                enableAccessibleFieldDOMStructure={false}
                slots={{
                  textField: (params) => <TextField {...params} fullWidth />
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <TimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(newValue) => setFormData({ ...formData, endTime: newValue })}
                enableAccessibleFieldDOMStructure={false}
                slots={{
                  textField: (params) => <TextField {...params} fullWidth />
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 120px', minWidth: 120 }}>
              <TextField
                label="Slot Duration (min)"
                type="number"
                value={formData.slotDuration}
                onChange={(e) => setFormData({ ...formData, slotDuration: parseInt(e.target.value) })}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: '1 1 120px', minWidth: 120 }}>
              <TextField
                label="Max Appointments"
                type="number"
                value={formData.maxAppointments}
                onChange={(e) => setFormData({ ...formData, maxAppointments: parseInt(e.target.value) })}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: '1 1 120px', minWidth: 120 }}>
              <TextField
                label="Timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  />
                }
                label="Recurring Slot"
              />
            </Box>
            {formData.isRecurring && (
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel>Recurrence Pattern</InputLabel>
                  <Select
                    value={formData.recurrencePattern}
                    onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value })}
                    label="Recurrence Pattern"
                  >
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              },
            }}
          >
            {selectedSlot ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AvailabilityManagement; 