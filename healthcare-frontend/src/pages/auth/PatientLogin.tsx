import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link as MuiLink,
  Avatar,
} from '@mui/material';
import {
  Person,
  ArrowForward,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object().shape({
  emailOrPhone: yup.string().required('Email or phone is required'),
  password: yup.string().required('Password is required'),
});

const PatientLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.patientLogin(data);
      if (response.success && response.data) {
        login(response.data);
        navigate('/patient/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Person sx={{ fontSize: 40, color: 'white' }} />
        </Avatar>
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
            mb: 1,
          }}
        >
          Patient Login
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}
        >
          Access your patient dashboard
        </Typography>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem',
              },
            }}
          >
            {error}
          </Alert>
        )}

        <form>
          <Box sx={{ mb: 3 }}>
            <Controller
              name="emailOrPhone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email or Phone"
                  type="text"
                  error={!!errors.emailOrPhone}
                  helperText={errors.emailOrPhone?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#34d399',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type="password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#34d399',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              )}
            />
          </Box>

          <Button
            type="button"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleLoginClick}
            endIcon={<ArrowForward />}
            sx={{ 
              mb: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                transform: 'none',
                boxShadow: 'none',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 2,
              color: 'text.secondary',
              fontSize: '0.95rem',
            }}
          >
            Don't have an account?{' '}
            <MuiLink 
              component={Link} 
              to="/patient/register"
              sx={{
                color: '#10b981',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Register here
            </MuiLink>
          </Typography>
          <Typography 
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.95rem',
            }}
          >
            Are you a provider?{' '}
            <MuiLink 
              component={Link} 
              to="/provider/login"
              sx={{
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Provider login
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PatientLogin; 