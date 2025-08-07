import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  People,
  Schedule,
  LocalHospital,
  Assignment,
  Add,
  Edit,
  Visibility,
  Today,
  Upcoming,
  History,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Provider } from '../../types';
import { apiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const navigate = useNavigate();

  const provider = user as Provider;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch provider profile
        const profileResponse = await apiService.getProviderProfile();
        if (profileResponse.success && profileResponse.data) {
          setProviderProfile(profileResponse.data);
        }

        // Fetch availability slots
        const availabilityResponse = await apiService.getMyAvailability({
          page: 1,
          limit: 10,
        });
        if (availabilityResponse.success && availabilityResponse.data) {
          setAvailabilitySlots(availabilityResponse.data.data?.data || []);
        }

        // Fetch appointments (this would need a separate API endpoint)
        // For now, we'll use empty array as the API doesn't have provider appointments endpoint
        setAppointments([]);

      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'booked':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const safeAvailabilitySlots = Array.isArray(availabilitySlots) ? availabilitySlots : [];
  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const statCards = [
    {
      title: 'Total Availability Slots',
      value: String(safeAvailabilitySlots.length),
      icon: <Schedule sx={{ fontSize: 40, color: 'white' }} />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    },
    {
      title: 'Available Slots',
      value: String(safeAvailabilitySlots.filter(slot => slot?.status === 'AVAILABLE').length),
      icon: <Today sx={{ fontSize: 40, color: 'white' }} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    {
      title: 'Booked Appointments',
      value: String(safeAvailabilitySlots.filter(slot => slot?.status === 'BOOKED').length),
      icon: <People sx={{ fontSize: 40, color: 'white' }} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    {
      title: "Today's Appointments",
      value: String(safeAppointments.filter(apt => apt?.date === new Date().toISOString().split('T')[0]).length),
      icon: <Upcoming sx={{ fontSize: 40, color: 'white' }} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
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
          Welcome back, Dr. {provider?.lastName}!
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Manage your availability and patient appointments
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {statCards.map((card, index) => (
          <Card 
            key={index}
            sx={{ 
              flex: '1 1 250px',
              background: card.gradient,
              color: 'white',
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 60,
                    height: 60,
                  }}
                >
                  {card.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Tabs */}
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
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              minHeight: 64,
              '&.Mui-selected': {
                color: '#2563eb',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2563eb',
              height: 3,
            },
          }}
        >
          <Tab label="Availability" />
          <Tab label="Appointments" />
        </Tabs>

        {/* Availability Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Your Availability Slots
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate('/provider/availability')}
            >
              Add Availability
            </Button>
          </Box>

          {safeAvailabilitySlots.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Schedule sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No availability slots found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first availability slot to start accepting appointments.
              </Typography>
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
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeAvailabilitySlots.map((slot) => (
                    <TableRow key={slot?.id || Math.random()} hover>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {slot?.date ? new Date(slot.date).toLocaleDateString() : '--'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {slot?.startTime && slot?.endTime ? `${slot.startTime} - ${slot.endTime}` : '--'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {slot?.slotDuration ? `${slot.slotDuration} min` : '--'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={slot?.status || '--'} 
                          color={getStatusColor(slot?.status || '') as any}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {slot?.currentAppointments ?? 0} / {slot?.maxAppointments ?? 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: '#2563eb',
                              '&:hover': { bgcolor: '#dbeafe' }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: '#10b981',
                              '&:hover': { bgcolor: '#d1fae5' }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Appointments Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Patient Appointments
            </Typography>
          </Box>

          {safeAppointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <People sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No appointments found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patient appointments will appear here once they book your availability slots.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeAppointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {appointment.patientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Age: {appointment.patientAge}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {appointment.date}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.time}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={appointment.type} 
                          size="small"
                          sx={{ 
                            bgcolor: '#e0f2fe',
                            color: '#0288d1',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={appointment.status} 
                          color={getStatusColor(appointment.status) as any}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: '#2563eb',
                              '&:hover': { bgcolor: '#dbeafe' }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: '#10b981',
                              '&:hover': { bgcolor: '#d1fae5' }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProviderDashboard; 