import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import ProviderRegister from './pages/auth/ProviderRegister';
import ProviderLogin from './pages/auth/ProviderLogin';
import PatientRegister from './pages/auth/PatientRegister';
import PatientLogin from './pages/auth/PatientLogin';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import AvailabilityManagement from './pages/provider/AvailabilityManagement';
import AppointmentSearch from './pages/patient/AppointmentSearch';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Context
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px rgba(0, 0, 0, 0.1), 0px 10px 20px rgba(0, 0, 0, 0.04)',
    '0px 30px 60px rgba(0, 0, 0, 0.1), 0px 15px 30px rgba(0, 0, 0, 0.04)',
    '0px 35px 70px rgba(0, 0, 0, 0.1), 0px 20px 40px rgba(0, 0, 0, 0.04)',
    '0px 40px 80px rgba(0, 0, 0, 0.1), 0px 25px 50px rgba(0, 0, 0, 0.04)',
    '0px 45px 90px rgba(0, 0, 0, 0.1), 0px 30px 60px rgba(0, 0, 0, 0.04)',
    '0px 50px 100px rgba(0, 0, 0, 0.1), 0px 35px 70px rgba(0, 0, 0, 0.04)',
    '0px 55px 110px rgba(0, 0, 0, 0.1), 0px 40px 80px rgba(0, 0, 0, 0.04)',
    '0px 60px 120px rgba(0, 0, 0, 0.1), 0px 45px 90px rgba(0, 0, 0, 0.04)',
    '0px 65px 130px rgba(0, 0, 0, 0.1), 0px 50px 100px rgba(0, 0, 0, 0.04)',
    '0px 70px 140px rgba(0, 0, 0, 0.1), 0px 55px 110px rgba(0, 0, 0, 0.04)',
    '0px 75px 150px rgba(0, 0, 0, 0.1), 0px 60px 120px rgba(0, 0, 0, 0.04)',
    '0px 80px 160px rgba(0, 0, 0, 0.1), 0px 65px 130px rgba(0, 0, 0, 0.04)',
    '0px 85px 170px rgba(0, 0, 0, 0.1), 0px 70px 140px rgba(0, 0, 0, 0.04)',
    '0px 90px 180px rgba(0, 0, 0, 0.1), 0px 75px 150px rgba(0, 0, 0, 0.04)',
    '0px 95px 190px rgba(0, 0, 0, 0.1), 0px 80px 160px rgba(0, 0, 0, 0.04)',
    '0px 100px 200px rgba(0, 0, 0, 0.1), 0px 85px 170px rgba(0, 0, 0, 0.04)',
    '0px 105px 210px rgba(0, 0, 0, 0.1), 0px 90px 180px rgba(0, 0, 0, 0.04)',
    '0px 110px 220px rgba(0, 0, 0, 0.1), 0px 95px 190px rgba(0, 0, 0, 0.04)',
    '0px 115px 230px rgba(0, 0, 0, 0.1), 0px 100px 200px rgba(0, 0, 0, 0.04)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563eb',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  
                  {/* Auth Routes */}
                  <Route path="/provider/register" element={<ProviderRegister />} />
                  <Route path="/provider/login" element={<ProviderLogin />} />
                  <Route path="/patient/register" element={<PatientRegister />} />
                  <Route path="/patient/login" element={<PatientLogin />} />
                  
                  {/* Protected Provider Routes */}
                  <Route 
                    path="/provider/dashboard" 
                    element={
                      <ProtectedRoute role="provider">
                        <ProviderDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/provider/availability" 
                    element={
                      <ProtectedRoute role="provider">
                        <AvailabilityManagement />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Protected Patient Routes */}
                  <Route 
                    path="/patient/dashboard" 
                    element={
                      <ProtectedRoute role="patient">
                        <PatientDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/patient/search" 
                    element={
                      <ProtectedRoute role="patient">
                        <AppointmentSearch />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
