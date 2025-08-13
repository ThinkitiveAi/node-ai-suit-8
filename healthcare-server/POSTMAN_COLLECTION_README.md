# Health First API - Postman Collection

## Overview

This Postman collection provides comprehensive coverage of the Health First healthcare application API endpoints. The collection is organized into logical folders covering all major functionality including authentication, patient management, provider management, and availability scheduling.

## Collection Structure

### 📊 System Health
- **Health Check**: Overall application health status
- **Readiness Check**: Application readiness for traffic
- **Liveness Check**: Application responsiveness
- **Application Metrics**: System performance metrics

### 🔐 Authentication
- **Register Patient**: Create new patient account
- **Register Provider**: Create new healthcare provider account
- **Patient Login**: Authenticate as patient
- **Provider Login**: Authenticate as provider
- **Refresh Token**: Renew access token
- **Logout**: Invalidate refresh token
- **Debug Token**: View current token information

### 👤 Patient Management
- **Get Patient Profile**: Retrieve authenticated patient's profile
- **Update Patient Profile**: Modify patient profile information

### 👨‍⚕️ Provider Management
- **Get Provider Profile**: Retrieve authenticated provider's profile
- **Update Provider Profile**: Modify provider profile information

### 📅 Basic Availability
- **Create Availability Slot**: Create single availability slot
- **Create Recurring Availability**: Create recurring availability slots
- **Create Bulk Availability**: Create multiple slots in one request
- **Get My Availability**: Retrieve provider's own availability
- **Get Provider Availability**: Get availability for specific provider
- **Update Availability Slot**: Modify existing availability slot
- **Delete Availability Slot**: Remove availability slot
- **Search Available Providers**: Find providers based on filters

### 🎯 Enhanced Availability
- **Create Comprehensive Availability**: Advanced availability with settings
- **Get Provider Settings**: Retrieve availability settings
- **Create/Update Provider Settings**: Configure availability settings
- **Get Provider Block Days**: View blocked days
- **Create Block Day**: Add blocked day
- **Create Bulk Block Days**: Add multiple blocked days
- **Get Enhanced Provider Availability**: Comprehensive provider availability
- **Get Provider Calendar**: Calendar view of availability

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select the `Health_First_API_Collection.json` file
4. The collection will be imported with all folders and requests

### 2. Configure Environment Variables
The collection uses the following variables that are automatically set:

- **`baseUrl`**: API base URL (default: `http://localhost:3000`)
- **`accessToken`**: JWT access token (auto-set after login)
- **`refreshToken`**: JWT refresh token (auto-set after login)
- **`providerId`**: Provider ID (auto-set after provider login)
- **`patientId`**: Patient ID (auto-set after patient login)

### 3. Authentication Flow

#### For Providers:
1. **Register Provider** or **Provider Login**
2. The access token will be automatically set
3. All subsequent requests will use the bearer token

#### For Patients:
1. **Register Patient** or **Patient Login**
2. The access token will be automatically set
3. All subsequent requests will use the bearer token

## Usage Examples

### Provider Workflow

#### 1. Register and Login
```bash
# 1. Register a new provider
POST {{baseUrl}}/api/v1/provider/register
{
  "email": "dr.smith@example.com",
  "password": "password123",
  "firstName": "Dr. John",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456",
  "yearsOfExperience": 5
}

# 2. Login (if already registered)
POST {{baseUrl}}/api/v1/provider/login
{
  "email": "dr.smith@example.com",
  "password": "password123"
}
```

#### 2. Set Up Availability
```bash
# 3. Create basic availability slot
POST {{baseUrl}}/api/v1/provider/availability
{
  "date": "2024-12-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "maxAppointments": 1
}

# 4. Set up comprehensive availability settings
POST {{baseUrl}}/api/v1/provider/settings/availability
{
  "workingHours": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "breakTime": {
    "startTime": "12:00",
    "endTime": "13:00"
  },
  "maxAppointmentsPerSlot": 1,
  "advanceBookingDays": 30
}
```

#### 3. Manage Block Days
```bash
# 5. Add holiday block days
POST {{baseUrl}}/api/v1/provider/block-days
{
  "date": "2024-12-25",
  "reason": "Christmas Holiday",
  "isRecurring": true
}
```

### Patient Workflow

#### 1. Register and Login
```bash
# 1. Register a new patient
POST {{baseUrl}}/api/v1/patient/register
{
  "email": "patient@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "FEMALE"
}

# 2. Login (if already registered)
POST {{baseUrl}}/api/v1/patient/login
{
  "email": "patient@example.com",
  "password": "password123"
}
```

#### 2. Search for Providers
```bash
# 3. Search for available providers
GET {{baseUrl}}/api/v1/availability/search?date=2024-12-15&specialization=Cardiology&city=New York
```

## Request Examples

### Authentication Requests

#### Register Provider
```json
{
  "email": "dr.smith@example.com",
  "password": "password123",
  "firstName": "Dr. John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456",
  "yearsOfExperience": 5,
  "clinicAddress": {
    "street": "123 Medical Center Dr",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

#### Create Availability Slot
```json
{
  "date": "2024-12-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "maxAppointments": 1,
  "timezone": "UTC",
  "isRecurring": false,
  "notes": "General consultations"
}
```

#### Create Recurring Availability
```json
{
  "date": "2024-12-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "maxAppointments": 1,
  "timezone": "UTC",
  "isRecurring": true,
  "recurrencePattern": "WEEKLY",
  "recurrenceEndDate": "2024-12-31",
  "notes": "Weekly consultations"
}
```

#### Comprehensive Availability
```json
{
  "daySlots": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ],
  "timeSlots": [
    {
      "startTime": "09:00",
      "endTime": "10:00",
      "duration": 30
    }
  ],
  "providerSettings": {
    "workingHours": {
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "breakTime": {
      "startTime": "12:00",
      "endTime": "13:00"
    },
    "maxAppointmentsPerSlot": 1,
    "advanceBookingDays": 30,
    "timezone": "UTC"
  },
  "blockDays": [
    {
      "date": "2024-12-25",
      "reason": "Christmas Holiday",
      "isRecurring": true
    }
  ]
}
```

## Response Examples

### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "dr.smith@example.com",
      "firstName": "Dr. John",
      "lastName": "Smith",
      "role": "provider"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Availability Response
```json
{
  "success": true,
  "message": "Availability slot created successfully",
  "data": {
    "id": 123,
    "providerId": 456,
    "date": "2024-12-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 30,
    "status": "AVAILABLE",
    "maxAppointments": 1,
    "currentAppointments": 0,
    "timezone": "UTC"
  }
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden - Provider role required",
  "statusCode": 403
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "Time slot overlaps with existing availability",
  "statusCode": 409
}
```

## Testing Tips

### 1. Environment Setup
- Ensure the server is running on `http://localhost:3000`
- Use the health check endpoints to verify server status

### 2. Authentication Testing
- Always start with registration/login
- Check that tokens are automatically set
- Verify token expiration and refresh

### 3. Availability Testing
- Test both basic and enhanced availability features
- Verify date/time validation
- Test overlapping slot prevention

### 4. Error Scenarios
- Test with invalid data
- Test unauthorized access
- Test conflicting operations

## Collection Features

### ✅ Automatic Token Management
- Tokens are automatically extracted from login responses
- Bearer authentication is automatically applied
- User IDs are stored for subsequent requests

### ✅ Comprehensive Coverage
- All API endpoints are included
- Both basic and enhanced availability features
- Complete authentication flow

### ✅ Realistic Examples
- Sample data matches API requirements
- Proper request/response examples
- Error handling documentation

### ✅ Easy Setup
- Pre-configured variables
- Clear folder organization
- Detailed descriptions

## Troubleshooting

### Common Issues

1. **Server Not Running**
   - Check if server is running on port 3000
   - Use health check endpoints to verify

2. **Authentication Errors**
   - Ensure login was successful
   - Check token expiration
   - Verify role-based access

3. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Ensure date/time format is correct

4. **CORS Issues**
   - Ensure server allows requests from Postman
   - Check server CORS configuration

## Support

For issues with the API or collection:
1. Check the server logs
2. Verify request/response format
3. Test with health check endpoints
4. Review error messages carefully

The collection is designed to work seamlessly with the Health First API and provides comprehensive testing capabilities for all features. 