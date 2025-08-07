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
  Add,
  Edit,
  Visibility,
  Upcoming,
  History,
  Notifications,
  TrendingUp,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Patient } from '../../types';
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
      id={`patient-dashboard-tabpanel-${index}`}
      aria-labelledby={`patient-dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const navigate = useNavigate();

  const patient = user as Patient;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch patient profile
        const profileResponse = await apiService.getPatientProfile();
        if (profileResponse.success && profileResponse.data) {
          setPatientProfile(profileResponse.data);
        }

        // Fetch appointments (this would need a separate API endpoint)
        // For now, we'll use empty array as the API doesn't have patient appointments endpoint
        setAppointments([]);

        // Fetch medical records (this would need a separate API endpoint)
        // For now, we'll use empty array as the API doesn't have medical records endpoint
        setMedicalRecords([]);

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
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const statCards = [
    {
      title: 'Total Appointments',
      value: appointments.length.toString(),
      icon: <Schedule sx={{ fontSize: 40, color: 'white' }} />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    },
    {
      title: 'Upcoming Appointments',
      value: appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length.toString(),
      icon: <Upcoming sx={{ fontSize: 40, color: 'white' }} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    {
      title: 'Medical Records',
      value: medicalRecords.length.toString(),
      icon: <Assignment sx={{ fontSize: 40, color: 'white' }} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    {
      title: 'Completed Visits',
      value: appointments.filter(apt => apt.status === 'completed').length.toString(),
      icon: <CheckCircle sx={{ fontSize: 40, color: 'white' }} />,
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Welcome back, {patient?.firstName}!
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Manage your appointments and medical records
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
                color: '#10b981',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#10b981',
              height: 3,
            },
          }}
        >
          <Tab label="Appointments" />
          <Tab label="Medical Records" />
        </Tabs>

        {/* Appointments Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Your Appointments
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate('/patient/search')}
            >
              Book New Appointment
            </Button>
          </Box>

          {appointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Schedule sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No appointments found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any appointments scheduled yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Provider</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {appointment.providerName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.specialization}
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
                        <Typography variant="body2" color="text.secondary">
                          {appointment.location}
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

        {/* Medical Records Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Medical Records
            </Typography>
          </Box>

          {medicalRecords.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No medical records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your medical records will appear here after your first appointment.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Provider</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicalRecords.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {record.date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.type} 
                          size="small"
                          sx={{ 
                            bgcolor: '#fef3c7',
                            color: '#d97706',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.provider}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.status} 
                          color="success"
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: '#2563eb',
                            '&:hover': { bgcolor: '#dbeafe' }
                          }}
                        >
                          <Visibility />
                        </IconButton>
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

export default PatientDashboard; 