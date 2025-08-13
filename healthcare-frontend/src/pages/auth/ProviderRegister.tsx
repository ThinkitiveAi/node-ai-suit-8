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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const schema = yup.object().shape({
  first_name: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  last_name: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone_number: yup.string().required('Phone number is required').matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number, and special character'),
  confirm_password: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  specialization: yup.string().required('Specialization is required').min(3, 'Specialization must be at least 3 characters').max(100, 'Specialization must be less than 100 characters'),
  license_number: yup.string().required('License number is required').matches(/^[A-Za-z0-9]+$/, 'License number must be alphanumeric'),
  years_of_experience: yup.number()
    .required('Years of experience is required')
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50'),
  clinic_address: yup.object().shape({
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

const steps = ['Personal Information', 'Professional Details', 'Clinic Address'];

const ProviderRegister: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
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
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      confirm_password: '',
      specialization: '',
      license_number: '',
      years_of_experience: 0,
      clinic_address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove confirmPassword from the data before sending
      const { confirmPassword, ...registrationData } = data;
      
      const response = await apiService.providerRegister(registrationData);
      
      if (response.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => {
          navigate('/provider/login');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={!!errors.first_name}
                      helperText={(errors.first_name?.message as string) || ''}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={!!errors.last_name}
                      helperText={(errors.last_name?.message as string) || ''}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
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
              </Box>
              <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
                <Controller
                  name="phone_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      placeholder="+1234567890"
                      error={!!errors.phone_number}
                      helperText={(errors.phone_number?.message as string) || ''}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
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
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <Controller
                    name="license_number"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="License Number"
                        error={!!errors.license_number}
                        helperText={(errors.license_number?.message as string) || ''}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <Controller
                    name="years_of_experience"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Years of Experience"
                        type="number"
                        error={!!errors.years_of_experience}
                        helperText={(errors.years_of_experience?.message as string) || ''}
                      />
                    )}
                  />
                </Box>
              </Box>
              <Box>
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
              <Box>
                <Controller
                  name="confirm_password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      error={!!errors.confirm_password}
                      helperText={(errors.confirm_password?.message as string) || ''}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Controller
                  name="clinic_address.street"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Street Address"
                      error={!!(errors.clinic_address as any)?.street}
                      helperText={((errors.clinic_address as any)?.street?.message as string) || ''}
                    />
                  )}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <Controller
                    name="clinic_address.city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="City"
                        error={!!(errors.clinic_address as any)?.city}
                        helperText={((errors.clinic_address as any)?.city?.message as string) || ''}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <Controller
                    name="clinic_address.state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="State"
                        error={!!(errors.clinic_address as any)?.state}
                        helperText={((errors.clinic_address as any)?.state?.message as string) || ''}
                      />
                    )}
                  />
                </Box>
              </Box>
              <Box>
                <Controller
                  name="clinic_address.zip"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="ZIP Code"
                      error={!!(errors.clinic_address as any)?.zip}
                      helperText={((errors.clinic_address as any)?.zip?.message as string) || ''}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleFormSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link to="/provider/login" style={{ textDecoration: 'none' }}>
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProviderRegister; 