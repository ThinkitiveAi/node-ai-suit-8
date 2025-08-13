import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required').matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  specialization: yup.string().required('Specialization is required').min(3, 'Specialization must be at least 3 characters').max(100, 'Specialization must be less than 100 characters'),
  licenseNumber: yup.string().required('License number is required').matches(/^[A-Za-z0-9]+$/, 'License number must be alphanumeric'),
  yearsOfExperience: yup.number()
    .required('Years of experience is required')
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50'),
  clinicAddress: yup.object().shape({
    street: yup.string().required('Street address is required').max(200, 'Street address must be less than 200 characters'),
    city: yup.string().required('City is required').max(100, 'City must be less than 100 characters'),
    state: yup.string().required('State is required').max(50, 'State must be less than 50 characters'),
    zip: yup.string().required('ZIP code is required').matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  }),
});

const specializations = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Internal Medicine',
  'Neurology',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Urology',
  'Other',
];

const ProviderRegister: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      specialization: '',
      licenseNumber: '',
      yearsOfExperience: 0,
      clinicAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
  });

  const onSubmit = async (data: any) => {
    console.log('Provider form submitted with data:', data);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove confirmPassword from the data before sending
      const { confirmPassword, ...registrationData } = data;
      
      console.log('Calling provider API with data:', registrationData);
      const response = await apiService.providerRegister(registrationData);
      console.log('Provider API response:', response);
      
      if (response.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => {
          navigate('/provider/login');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Provider registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('Provider form submit event triggered');
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Provider Registration
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Join our healthcare network as a provider
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleFormSubmit}>
          {/* Personal Information Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Personal Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={!!errors.firstName}
                      helperText={(errors.firstName?.message as string) || ''}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={!!errors.lastName}
                      helperText={(errors.lastName?.message as string) || ''}
                    />
                  )}
                />
              </Box>
            </Box>
            
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={(errors.email?.message as string) || ''}
                />
              )}
            />
            
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone Number"
                  placeholder="+1234567890"
                  error={!!errors.phoneNumber}
                  helperText={(errors.phoneNumber?.message as string) || ''}
                />
              )}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Security Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Security
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
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
                    helperText={(errors.password?.message as string) || ''}
                  />
                )}
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    error={!!errors.confirmPassword}
                    helperText={(errors.confirmPassword?.message as string) || ''}
                  />
                )}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Professional Information Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Professional Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Controller
              name="specialization"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.specialization}>
                  <InputLabel>Specialization</InputLabel>
                  <Select {...field} label="Specialization">
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.specialization && (
                    <Typography color="error" variant="caption">
                      {(errors.specialization?.message as string) || ''}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="licenseNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="License Number"
                      error={!!errors.licenseNumber}
                      helperText={(errors.licenseNumber?.message as string) || ''}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="yearsOfExperience"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Years of Experience"
                      type="number"
                      error={!!errors.yearsOfExperience}
                      helperText={(errors.yearsOfExperience?.message as string) || ''}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Clinic Address Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Clinic Address
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Controller
              name="clinicAddress.street"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Street Address"
                  error={!!(errors.clinicAddress as any)?.street}
                  helperText={((errors.clinicAddress as any)?.street?.message as string) || ''}
                />
              )}
            />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="clinicAddress.city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                      error={!!(errors.clinicAddress as any)?.city}
                      helperText={((errors.clinicAddress as any)?.city?.message as string) || ''}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="clinicAddress.state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State"
                      error={!!(errors.clinicAddress as any)?.state}
                      helperText={((errors.clinicAddress as any)?.state?.message as string) || ''}
                    />
                  )}
                />
              </Box>
            </Box>
            
            <Controller
              name="clinicAddress.zip"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="ZIP Code"
                  error={!!(errors.clinicAddress as any)?.zip}
                  helperText={((errors.clinicAddress as any)?.zip?.message as string) || ''}
                />
              )}
            />
          </Box>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ minWidth: 200, py: 1.5 }}
              onClick={() => {
                console.log('Provider submit button clicked');
                console.log('Provider form errors:', errors);
                console.log('Provider loading state:', loading);
              }}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </Box>

          {/* Debug Information - Show validation errors */}
          {Object.keys(errors).length > 0 && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="h6" color="error.dark">
                Validation Errors (Debug):
              </Typography>
              <pre style={{ fontSize: '12px', color: '#d32f2f' }}>
                {JSON.stringify(errors, null, 2)}
              </pre>
            </Box>
          )}
        </form>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link to="/provider/login" style={{ textDecoration: 'none', color: '#2563eb' }}>
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProviderRegister; 