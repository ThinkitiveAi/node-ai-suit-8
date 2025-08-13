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
  Checkbox,
  FormControlLabel,
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
  dateOfBirth: yup.string()
    .required('Date of birth is required')
    .test('age', 'Must be at least 13 years old', function(value) {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 13;
      }
      return age >= 13;
    }),
  gender: yup.string().required('Gender is required').oneOf(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  address: yup.object().shape({
    street: yup.string().required('Street address is required').max(200, 'Street address must be less than 200 characters'),
    city: yup.string().required('City is required').max(100, 'City must be less than 100 characters'),
    state: yup.string().required('State is required').max(50, 'State must be less than 50 characters'),
    zip: yup.string().required('ZIP code is required').matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  }),
  emergencyContact: yup.object().shape({
    name: yup.string().max(100, 'Name must be less than 100 characters'),
    phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    relationship: yup.string().max(50, 'Relationship must be less than 50 characters'),
  }),
  insuranceInfo: yup.object().shape({
    provider: yup.string(),
    policyNumber: yup.string(),
  }),
});

const PatientRegister: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [includeEmergencyContact, setIncludeEmergencyContact] = useState(false);
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: 'PREFER_NOT_TO_SAY',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
      insuranceInfo: {
        provider: '',
        policyNumber: '',
      },
    },
  });

  const onSubmit = async (data: any) => {
    console.log('Form submitted with data:', data);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove confirmPassword from the data before sending
      const { confirmPassword, ...registrationData } = data;
      
      // Only include emergency contact and insurance if user opted in
      if (!includeEmergencyContact) {
        delete registrationData.emergencyContact;
      }
      if (!includeInsurance) {
        delete registrationData.insuranceInfo;
      }

      console.log('Calling API with data:', registrationData);
      const response = await apiService.patientRegister(registrationData);
      console.log('API response:', response);
      
      if (response.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => {
          navigate('/patient/login');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('Form submit event triggered');
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Patient Registration
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Create your patient account to access healthcare services
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
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateOfBirth}
                      helperText={(errors.dateOfBirth?.message as string) || ''}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.gender}>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender">
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                        <MenuItem value="PREFER_NOT_TO_SAY">Prefer not to say</MenuItem>
                      </Select>
                      {errors.gender && (
                        <Typography color="error" variant="caption">
                          {(errors.gender?.message as string) || ''}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </Box>
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

          {/* Address Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Address Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Controller
              name="address.street"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Street Address"
                  error={!!(errors.address as any)?.street}
                  helperText={((errors.address as any)?.street?.message as string) || ''}
                />
              )}
            />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                      error={!!(errors.address as any)?.city}
                      helperText={((errors.address as any)?.city?.message as string) || ''}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State"
                      error={!!(errors.address as any)?.state}
                      helperText={((errors.address as any)?.state?.message as string) || ''}
                    />
                  )}
                />
              </Box>
            </Box>
            
            <Controller
              name="address.zip"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="ZIP Code"
                  error={!!(errors.address as any)?.zip}
                  helperText={((errors.address as any)?.zip?.message as string) || ''}
                />
              )}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Optional Information Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Optional Information
          </Typography>

          {/* Emergency Contact */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeEmergencyContact}
                  onChange={(e) => setIncludeEmergencyContact(e.target.checked)}
                />
              }
              label="Include Emergency Contact Information"
            />
            {includeEmergencyContact && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Controller
                  name="emergencyContact.name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Emergency Contact Name"
                      error={!!(errors.emergencyContact as any)?.name}
                      helperText={((errors.emergencyContact as any)?.name?.message as string) || ''}
                    />
                  )}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Controller
                      name="emergencyContact.phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Emergency Contact Phone"
                          error={!!(errors.emergencyContact as any)?.phone}
                          helperText={((errors.emergencyContact as any)?.phone?.message as string) || ''}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <Controller
                      name="emergencyContact.relationship"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Relationship"
                          error={!!(errors.emergencyContact as any)?.relationship}
                          helperText={((errors.emergencyContact as any)?.relationship?.message as string) || ''}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Insurance Information */}
          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeInsurance}
                  onChange={(e) => setIncludeInsurance(e.target.checked)}
                />
              }
              label="Include Insurance Information"
            />
            {includeInsurance && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <Controller
                    name="insuranceInfo.provider"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Insurance Provider"
                        error={!!(errors.insuranceInfo as any)?.provider}
                        helperText={((errors.insuranceInfo as any)?.provider?.message as string) || ''}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <Controller
                    name="insuranceInfo.policyNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Policy Number"
                        error={!!(errors.insuranceInfo as any)?.policyNumber}
                        helperText={((errors.insuranceInfo as any)?.policyNumber?.message as string) || ''}
                      />
                    )}
                  />
                </Box>
              </Box>
            )}
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
                console.log('Submit button clicked');
                console.log('Form errors:', errors);
                console.log('Loading state:', loading);
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
            <Link to="/patient/login" style={{ textDecoration: 'none', color: '#2563eb' }}>
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PatientRegister; 