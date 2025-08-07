import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Rating,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  LocationOn,
  BookOnline,
  Schedule,
  Person,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { apiService } from '../../services/api';

const AppointmentSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    date: '',
    specialization: '',
    city: '',
    appointmentType: '',
    maxPrice: '',
    insuranceAccepted: '' as string,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    patientName: '',
    patientPhone: '',
    notes: '',
  });

  useEffect(() => {
    // Initial search with default parameters
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (searchParams.date) params.date = searchParams.date;
      if (searchParams.specialization) params.specialization = searchParams.specialization;
      if (searchParams.city) params.city = searchParams.city;
      if (searchParams.appointmentType) params.appointmentType = searchParams.appointmentType;
      if (searchParams.maxPrice) params.maxPrice = searchParams.maxPrice;
      if (searchParams.insuranceAccepted) params.insuranceAccepted = searchParams.insuranceAccepted === 'true';

      const response = await apiService.searchAppointments(params);
      if (response.success && response.data) {
        setProviders(response.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search for providers');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (slot: any) => {
    setSelectedSlot(slot);
    setBookingDialog(true);
  };

  const handleBookingSubmit = async () => {
    try {
      if (!bookingData.patientName || !bookingData.patientPhone) {
        setError('Please fill in all required fields');
        return;
      }

      const appointmentData = {
        patientName: bookingData.patientName,
        patientPhone: bookingData.patientPhone,
        notes: bookingData.notes,
        appointmentType: selectedSlot.appointmentType || 'consultation',
      };

      await apiService.bookAppointment(selectedSlot.id, appointmentData);
      
      setBookingDialog(false);
      setSelectedSlot(null);
      setBookingData({ patientName: '', patientPhone: '', notes: '' });
      
      // Refresh search results
      handleSearch();
      
      // Show success message (you could add a success state)
      alert('Appointment booked successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Internal Medicine',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology',
  ];

  const appointmentTypes = [
    'consultation',
    'follow_up',
    'emergency',
    'telemedicine',
  ];

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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Find Available Providers
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Search for healthcare providers and book appointments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Filters */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Search Filters
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <DatePicker
              label="Preferred Date"
              value={searchParams.date ? new Date(searchParams.date) : null}
              onChange={(newValue) => setSearchParams({ 
                ...searchParams, 
                date: newValue ? newValue.toISOString().split('T')[0] : '' 
              })}
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: (params) => <TextField {...params} fullWidth />
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={searchParams.specialization}
                onChange={(e) => setSearchParams({ ...searchParams, specialization: e.target.value })}
                label="Specialization"
              >
                <MenuItem value="">All Specializations</MenuItem>
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <TextField
              label="City"
              value={searchParams.city}
              onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <FormControl fullWidth>
              <InputLabel>Appointment Type</InputLabel>
              <Select
                value={searchParams.appointmentType}
                onChange={(e) => setSearchParams({ ...searchParams, appointmentType: e.target.value })}
                label="Appointment Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {appointmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
            <TextField
              label="Max Price ($)"
              type="number"
              value={searchParams.maxPrice}
              onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Insurance</InputLabel>
              <Select
                value={searchParams.insuranceAccepted}
                onChange={(e) => setSearchParams({ ...searchParams, insuranceAccepted: e.target.value })}
                label="Insurance"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Accepts Insurance</MenuItem>
                <MenuItem value="false">Self Pay Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                height: '56px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Search Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      ) : providers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Search sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No providers found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria to find available providers.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {providers.map((provider) => (
            <Card 
              key={provider.id}
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {/* Provider Info */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mr: 2,
                          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                        }}
                      >
                        <Person sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {provider.provider?.firstName} {provider.provider?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {provider.provider?.specialization} • {provider.provider?.yearsOfExperience} years experience
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {provider.provider?.clinicCity}, {provider.provider?.clinicState}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={provider.status} 
                        size="small"
                        color="success"
                        sx={{ fontWeight: 500 }}
                      />
                      {provider.provider?.insuranceAccepted && (
                        <Chip 
                          label="Accepts Insurance" 
                          size="small"
                          sx={{ 
                            bgcolor: '#d1fae5',
                            color: '#059669',
                            fontWeight: 500,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Availability Info */}
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Available Slots
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {new Date(provider.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {provider.startTime} - {provider.endTime}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {provider.slotDuration} min
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Action */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<BookOnline />}
                      onClick={() => handleBookAppointment(provider)}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Book Appointment
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Booking Dialog */}
      <Dialog 
        open={bookingDialog} 
        onClose={() => setBookingDialog(false)}
        maxWidth="sm"
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
          Book Appointment
        </DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedSlot.provider?.firstName} {selectedSlot.provider?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {selectedSlot.provider?.specialization}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {new Date(selectedSlot.date).toLocaleDateString()} at {selectedSlot.startTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {selectedSlot.slotDuration} minutes
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Your Name"
              value={bookingData.patientName}
              onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              value={bookingData.patientPhone}
              onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setBookingDialog(false)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBookingSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              },
            }}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentSearch; 