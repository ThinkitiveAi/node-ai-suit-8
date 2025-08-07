import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Avatar,
} from '@mui/material';
import {
  LocalHospital,
  Search,
  Security,
  Support,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <LocalHospital sx={{ fontSize: 48, color: '#2563eb' }} />,
      title: 'Provider Management',
      description: 'Healthcare providers can manage their availability, appointments, and patient records efficiently.',
      color: '#dbeafe',
    },
    {
      icon: <Search sx={{ fontSize: 48, color: '#10b981' }} />,
      title: 'Easy Appointment Booking',
      description: 'Patients can search for available slots and book appointments with their preferred healthcare providers.',
      color: '#d1fae5',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#f59e0b' }} />,
      title: 'Secure & HIPAA Compliant',
      description: 'Your health information is protected with industry-standard security measures and HIPAA compliance.',
      color: '#fef3c7',
    },
    {
      icon: <Support sx={{ fontSize: 48, color: '#ef4444' }} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you with any questions or concerns.',
      color: '#fee2e2',
    },
  ];

  const benefits = [
    'Streamlined patient care workflow',
    'Real-time appointment scheduling',
    'Secure medical record management',
    'HIPAA compliant data protection',
    'Mobile-responsive interface',
    'Integrated billing and insurance',
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 6,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            zIndex: 1,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            p: { xs: 4, md: 8 },
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
              <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 3,
                  }}
                >
                  HealthCare Connect EMR
                </Typography>
                <Typography 
                  variant="h5" 
                  paragraph
                  sx={{ 
                    mb: 4,
                    opacity: 0.9,
                    lineHeight: 1.6,
                  }}
                >
                  Complete Electronic Medical Record system for healthcare providers. 
                  Manage patients, appointments, medical records, and improve healthcare delivery.
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={3}
                  sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/provider/register"
                    endIcon={<ArrowForward />}
                    sx={{ 
                      minWidth: 220,
                      py: 1.5,
                      px: 4,
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Register as Provider
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    to="/patient/register"
                    endIcon={<ArrowForward />}
                    sx={{ 
                      minWidth: 220,
                      py: 1.5,
                      px: 4,
                      color: 'white',
                      borderColor: 'white',
                      borderWidth: '2px',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Register as Patient
                  </Button>
                </Stack>
              </Box>
              <Box sx={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Avatar
                  sx={{
                    width: 300,
                    height: 300,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <LocalHospital sx={{ fontSize: 120, color: 'white' }} />
                </Avatar>
              </Box>
            </Box>
          </Container>
        </Box>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Complete EMR Solution
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Comprehensive electronic medical record management system designed for modern healthcare
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Box sx={{ flex: '1 1 250px', maxWidth: 300, minWidth: 250 }} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  p: 3,
                  background: `linear-gradient(135deg, ${feature.color} 0%, rgba(255,255,255,0.8) 100%)`,
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h3"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <Typography 
                variant="h3" 
                component="h2" 
                gutterBottom
                sx={{ fontWeight: 700, mb: 3 }}
              >
                Why Choose HealthCare Connect?
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                paragraph
                sx={{ mb: 4, lineHeight: 1.7 }}
              >
                Our comprehensive EMR system is designed to streamline healthcare operations, 
                improve patient care, and ensure compliance with industry standards.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {benefits.map((benefit, index) => (
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle sx={{ color: '#10b981', mr: 2, fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {benefit}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Card
                sx={{
                  width: 300,
                  height: 300,
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <LocalHospital sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Trusted by Healthcare Professionals
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white', 
          py: 8 
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Ready to Get Started?
            </Typography>
            <Typography 
              variant="h6" 
              paragraph
              sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}
            >
              Join healthcare providers using our comprehensive EMR system
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/provider/login"
                endIcon={<ArrowForward />}
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  px: 4,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Provider Login
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/patient/login"
                endIcon={<ArrowForward />}
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  px: 4,
                  color: 'white',
                  borderColor: 'white',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Patient Login
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 