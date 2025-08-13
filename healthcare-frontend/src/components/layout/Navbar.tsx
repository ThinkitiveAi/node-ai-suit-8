import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Container,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  AccountCircle,
  Dashboard,
  Schedule,
  Search,
  Logout,
  ArrowDropDown,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'provider') {
      return '/provider/dashboard';
    } else if (user?.role === 'patient') {
      return '/patient/dashboard';
    }
    return '/';
  };

  const getAvailabilityLink = () => {
    if (user?.role === 'provider') {
      return '/provider/availability';
    } else if (user?.role === 'patient') {
      return '/patient/search';
    }
    return '/';
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ px: { xs: 0 } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ 
              mr: 2,
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <HospitalIcon />
          </IconButton>

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.5px',
              '&:hover': {
                opacity: 0.9,
              },
              transition: 'opacity 0.3s ease',
            }}
          >
            HealthCare Connect
          </Typography>

          {!isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                color="inherit"
                component={Link}
                to="/provider/login"
                startIcon={<AccountCircle />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Provider Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/patient/login"
                startIcon={<AccountCircle />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Patient Login
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/provider/register"
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Register
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={user?.role === 'provider' ? 'Provider' : 'Patient'}
                color="secondary"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
              
              <Button
                color="inherit"
                component={Link}
                to={getDashboardLink()}
                startIcon={<Dashboard />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Dashboard
              </Button>

              <Button
                color="inherit"
                component={Link}
                to={getAvailabilityLink()}
                startIcon={user?.role === 'provider' ? <Schedule /> : <Search />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {user?.role === 'provider' ? 'Availability' : 'Search'}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    p: 1,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Avatar>
                  <ArrowDropDown sx={{ ml: 0.5, fontSize: 20 }} />
                </IconButton>

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      minWidth: 200,
                    },
                  }}
                >
                  <MenuItem 
                    onClick={handleClose} 
                    component={Link} 
                    to={getDashboardLink()}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      '&:hover': {
                        background: 'rgba(37, 99, 235, 0.1)',
                      },
                    }}
                  >
                    <Dashboard sx={{ mr: 2, color: 'primary.main' }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem 
                    onClick={handleClose} 
                    component={Link} 
                    to={getAvailabilityLink()}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      '&:hover': {
                        background: 'rgba(37, 99, 235, 0.1)',
                      },
                    }}
                  >
                    {user?.role === 'provider' ? (
                      <>
                        <Schedule sx={{ mr: 2, color: 'primary.main' }} />
                        Manage Availability
                      </>
                    ) : (
                      <>
                        <Search sx={{ mr: 2, color: 'primary.main' }} />
                        Search Appointments
                      </>
                    )}
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      color: 'error.main',
                      '&:hover': {
                        background: 'rgba(239, 68, 68, 0.1)',
                      },
                    }}
                  >
                    <Logout sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 