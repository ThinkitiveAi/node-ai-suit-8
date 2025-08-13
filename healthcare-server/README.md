# Health First API Documentation

## Overview

Health First is a comprehensive healthcare application that provides patient management, provider management, and availability scheduling functionality. This API enables healthcare providers to manage their availability and patients to search for available providers.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [System Health](#system-health)
- [Patient Management](#patient-management)
- [Provider Management](#provider-management)
- [Basic Availability](#basic-availability)
- [Enhanced Availability](#enhanced-availability)
- [Error Responses](#error-responses)

## Getting Started

### Base URL
```
http://localhost:3000
```

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run prisma:migrate

# Start the development server
npm run start:dev
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid JWT token in the Authorization header.

### Authorization Header Format
```
Authorization: Bearer <your-jwt-token>
```

---

## System Health

### Health Check
**GET** `/health`

Check the overall health status of the application and its dependencies.

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  },
  "error": {},
  "details": {}
}
```

### Readiness Check
**GET** `/health/ready`

Check if the application is ready to serve traffic.

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0"
}
```

### Liveness Check
**GET** `/health/live`

Check if the application is alive and responding.

**Response:**
```json
{
  "status": "alive",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "pid": 12345,
  "memory": {
    "heapUsed": 45.2,
    "heapTotal": 67.8,
    "external": 12.3,
    "rss": 89.1
  }
}
```

### Application Metrics
**GET** `/health/metrics`

Get basic application metrics for monitoring.

**Response:**
```json
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0",
  "environment": "development",
  "nodejs": "v18.17.0",
  "memory": {
    "heapUsed": 45.2,
    "heapTotal": 67.8,
    "external": 12.3,
    "rss": 89.1
  },
  "cpu": {
    "user": 123456,
    "system": 78901
  },
  "database": {
    "connections": 1
  }
}
```

---

## Authentication

### Register Patient
**POST** `/api/v1/patient/register`

Register a new patient account.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "patient@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Register Provider
**POST** `/api/v1/provider/register`

Register a new healthcare provider account.

**Request Body:**
```json
{
  "email": "provider@example.com",
  "password": "password123",
  "firstName": "Dr. Jane",
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

**Response:**
```json
{
  "success": true,
  "message": "Provider registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "provider@example.com",
      "firstName": "Dr. Jane",
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

### Patient Login
**POST** `/api/v1/patient/login`

Authenticate as a patient.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "patient@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Provider Login
**POST** `/api/v1/provider/login`

Authenticate as a healthcare provider.

**Request Body:**
```json
{
  "email": "provider@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "provider@example.com",
      "firstName": "Dr. Jane",
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

### Refresh Token
**POST** `/api/v1/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

### Logout
**POST** `/api/v1/auth/logout`

Logout and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Debug Token
**GET** `/api/v1/auth/debug`

View current token information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token debug information",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "provider",
    "iat": 1642234567,
    "exp": 1642238167
  }
}
```

---

## Patient Management

### Get Patient Profile
**GET** `/api/v1/patient/profile`

Get the authenticated patient's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Patient profile retrieved successfully",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Patient Profile
**PATCH** `/api/v1/patient/profile`

Update the authenticated patient's profile.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phoneNumber": "+1234567891",
  "address": {
    "street": "456 Updated St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient profile updated successfully",
  "data": {
    "id": "uuid",
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567891",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "address": {
      "street": "456 Updated St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

## Provider Management

### Get Provider Profile
**GET** `/api/v1/provider/profile`

Get the authenticated provider's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Provider profile retrieved successfully",
  "data": {
    "id": "uuid",
    "firstName": "Dr. Jane",
    "lastName": "Smith",
    "email": "dr.jane.smith@example.com",
    "phoneNumber": "+1234567890",
    "specialization": "Cardiology",
    "licenseNumber": "MD123456",
    "yearsOfExperience": 5,
    "clinicAddress": {
      "street": "123 Medical Center Dr",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Provider Profile
**PATCH** `/api/v1/provider/profile`

Update the authenticated provider's profile.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Dr. Jane Updated",
  "lastName": "Smith Updated",
  "phoneNumber": "+1234567891",
  "specialization": "Neurology",
  "yearsOfExperience": 6,
  "clinicAddress": {
    "street": "456 Updated Medical Center Dr",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider profile updated successfully",
  "data": {
    "id": "uuid",
    "firstName": "Dr. Jane Updated",
    "lastName": "Smith Updated",
    "email": "dr.jane.smith@example.com",
    "phoneNumber": "+1234567891",
    "specialization": "Neurology",
    "licenseNumber": "MD123456",
    "yearsOfExperience": 6,
    "clinicAddress": {
      "street": "456 Updated Medical Center Dr",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

## Basic Availability

### Create Availability Slot
**POST** `/api/v1/provider/availability`

Create a new availability slot for the authenticated provider.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
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

**Response:**
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
    "isRecurring": false,
    "recurrencePattern": null,
    "recurrenceEndDate": null,
    "slotDuration": 30,
    "status": "AVAILABLE",
    "maxAppointments": 1,
    "currentAppointments": 0,
    "notes": "General consultations",
    "timezone": "UTC",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Create Recurring Availability
**POST** `/api/v1/provider/availability`

Create recurring availability slots.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
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

**Response:**
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
    "isRecurring": true,
    "recurrencePattern": "WEEKLY",
    "recurrenceEndDate": "2024-12-31",
    "slotDuration": 30,
    "status": "AVAILABLE",
    "maxAppointments": 1,
    "currentAppointments": 0,
    "notes": "Weekly consultations",
    "timezone": "UTC",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Create Bulk Availability
**POST** `/api/v1/provider/availability/bulk`

Create multiple availability slots in a single request.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "slots": [
    {
      "date": "2024-12-15",
      "startTime": "09:00",
      "endTime": "12:00",
      "slotDuration": 30,
      "maxAppointments": 1,
      "timezone": "UTC"
    },
    {
      "date": "2024-12-16",
      "startTime": "14:00",
      "endTime": "17:00",
      "slotDuration": 30,
      "maxAppointments": 1,
      "timezone": "UTC"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk availability creation completed",
  "data": {
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "id": 123,
        "providerId": 456,
        "date": "2024-12-15",
        "startTime": "09:00",
        "endTime": "12:00",
        "slotDuration": 30,
        "status": "AVAILABLE",
        "maxAppointments": 1,
        "currentAppointments": 0,
        "timezone": "UTC"
      },
      {
        "id": 124,
        "providerId": 456,
        "date": "2024-12-16",
        "startTime": "14:00",
        "endTime": "17:00",
        "slotDuration": 30,
        "status": "AVAILABLE",
        "maxAppointments": 1,
        "currentAppointments": 0,
        "timezone": "UTC"
      }
    ],
    "errors": []
  }
}
```

### Get My Availability
**GET** `/api/v1/provider/availability/my`

Get the authenticated provider's availability slots.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `startDate` (optional): Filter by start date range
- `endDate` (optional): Filter by end date range
- `status` (optional): Filter by status (AVAILABLE, BOOKED, CANCELLED)

**Response:**
```json
{
  "success": true,
  "message": "Provider availability retrieved successfully",
  "data": {
    "data": [
      {
        "id": 123,
        "providerId": 456,
        "date": "2024-12-15",
        "startTime": "09:00",
        "endTime": "17:00",
        "isRecurring": false,
        "recurrencePattern": null,
        "recurrenceEndDate": null,
        "slotDuration": 30,
        "status": "AVAILABLE",
        "maxAppointments": 1,
        "currentAppointments": 0,
        "notes": "General consultations",
        "timezone": "UTC",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Get Provider Availability
**GET** `/api/v1/provider/{providerId}/availability`

Get availability slots for a specific provider.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `startDate` (optional): Filter by start date range
- `endDate` (optional): Filter by end date range
- `status` (optional): Filter by status (AVAILABLE, BOOKED, CANCELLED)

**Response:**
```json
{
  "success": true,
  "message": "Provider availability retrieved successfully",
  "data": {
    "data": [
      {
        "id": 123,
        "providerId": 456,
        "date": "2024-12-15",
        "startTime": "09:00",
        "endTime": "17:00",
        "isRecurring": false,
        "recurrencePattern": null,
        "recurrenceEndDate": null,
        "slotDuration": 30,
        "status": "AVAILABLE",
        "maxAppointments": 1,
        "currentAppointments": 0,
        "notes": "General consultations",
        "timezone": "UTC",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Update Availability Slot
**PUT** `/api/v1/provider/availability/{slotId}`

Update an existing availability slot.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "startTime": "10:00",
  "endTime": "18:00",
  "status": "AVAILABLE",
  "notes": "Updated consultation hours"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Availability slot updated successfully",
  "data": {
    "id": 123,
    "providerId": 456,
    "date": "2024-12-15",
    "startTime": "10:00",
    "endTime": "18:00",
    "isRecurring": false,
    "recurrencePattern": null,
    "recurrenceEndDate": null,
    "slotDuration": 30,
    "status": "AVAILABLE",
    "maxAppointments": 1,
    "currentAppointments": 0,
    "notes": "Updated consultation hours",
    "timezone": "UTC",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Delete Availability Slot
**DELETE** `/api/v1/provider/availability/{slotId}`

Delete an availability slot.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```
HTTP 204 No Content
```

### Search Available Providers
**GET** `/api/v1/availability/search`

Search for available providers based on filters.

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `startDate` (optional): Filter by start date range
- `endDate` (optional): Filter by end date range
- `startTime` (optional): Filter by start time (HH:mm)
- `endTime` (optional): Filter by end time (HH:mm)
- `specialization` (optional): Filter by provider specialization
- `city` (optional): Filter by clinic city
- `state` (optional): Filter by clinic state
- `status` (optional): Filter by status (default: AVAILABLE)
- `minDuration` (optional): Minimum slot duration in minutes
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `timezone` (optional): User timezone (default: UTC)

**Response:**
```json
{
  "success": true,
  "message": "Available providers found",
  "data": {
    "data": [
      {
        "id": 123,
        "providerId": 456,
        "date": "2024-12-15",
        "startTime": "09:00",
        "endTime": "17:00",
        "isRecurring": false,
        "recurrencePattern": null,
        "recurrenceEndDate": null,
        "slotDuration": 30,
        "status": "AVAILABLE",
        "maxAppointments": 1,
        "currentAppointments": 0,
        "notes": "General consultations",
        "timezone": "UTC",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z",
        "provider": {
          "id": 456,
          "firstName": "Dr. Jane",
          "lastName": "Smith",
          "email": "dr.jane.smith@example.com",
          "specialization": "Cardiology",
          "yearsOfExperience": 5,
          "clinicCity": "New York",
          "clinicState": "NY"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## Enhanced Availability

### Create Comprehensive Availability
**POST** `/api/v1/provider/availability/comprehensive`

Create comprehensive availability with day slots, time slots, provider settings, and block days.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "daySlots": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    },
    {
      "dayOfWeek": 2,
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
    },
    {
      "startTime": "10:00",
      "endTime": "11:00",
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

**Response:**
```json
{
  "success": true,
  "message": "Comprehensive availability created successfully",
  "data": {
    "daySlots": [
      {
        "id": 1,
        "providerId": 456,
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      }
    ],
    "timeSlots": [
      {
        "id": 1,
        "providerId": 456,
        "startTime": "09:00",
        "endTime": "10:00",
        "duration": 30
      }
    ],
    "providerSettings": {
      "id": 1,
      "providerId": 456,
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
        "id": 1,
        "providerId": 456,
        "date": "2024-12-25",
        "reason": "Christmas Holiday",
        "isRecurring": true
      }
    ]
  }
}
```

### Get Provider Settings
**GET** `/api/v1/provider/settings/availability`

Get the authenticated provider's availability settings.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Provider settings retrieved successfully",
  "data": {
    "id": 1,
    "providerId": 456,
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
  }
}
```

### Create/Update Provider Settings
**POST** `/api/v1/provider/settings/availability`

Create or update provider availability settings.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
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
  "advanceBookingDays": 30,
  "timezone": "UTC"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider settings saved successfully",
  "data": {
    "id": 1,
    "providerId": 456,
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
  }
}
```

### Get Provider Block Days
**GET** `/api/v1/provider/block-days`

Get the authenticated provider's blocked days.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Block days retrieved successfully",
  "data": [
    {
      "id": 1,
      "providerId": 456,
      "date": "2024-12-25",
      "reason": "Christmas Holiday",
      "isRecurring": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Block Day
**POST** `/api/v1/provider/block-days`

Create a blocked day for the authenticated provider.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2024-12-25",
  "reason": "Christmas Holiday",
  "isRecurring": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Block day created successfully",
  "data": {
    "id": 1,
    "providerId": 456,
    "date": "2024-12-25",
    "reason": "Christmas Holiday",
    "isRecurring": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Create Bulk Block Days
**POST** `/api/v1/provider/block-days/bulk`

Create multiple blocked days for the authenticated provider.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "blockDays": [
    {
      "date": "2024-12-25",
      "reason": "Christmas Holiday",
      "isRecurring": true
    },
    {
      "date": "2024-12-26",
      "reason": "Boxing Day",
      "isRecurring": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Block days created successfully",
  "data": [
    {
      "id": 1,
      "providerId": 456,
      "date": "2024-12-25",
      "reason": "Christmas Holiday",
      "isRecurring": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "providerId": 456,
      "date": "2024-12-26",
      "reason": "Boxing Day",
      "isRecurring": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Enhanced Provider Availability
**GET** `/api/v1/providers/{providerId}/availability/enhanced`

Get comprehensive availability information for a specific provider.

**Query Parameters:**
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Enhanced provider availability retrieved successfully",
  "data": {
    "settings": {
      "id": 1,
      "providerId": 456,
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
        "id": 1,
        "providerId": 456,
        "date": "2024-12-25",
        "reason": "Christmas Holiday",
        "isRecurring": true
      }
    ]
  }
}
```

### Get Provider Calendar
**GET** `/api/v1/availability/calendar/{providerId}`

Get calendar view of provider availability.

**Query Parameters:**
- `month` (optional): Month to view (YYYY-MM, default: current month)

**Response:**
```json
{
  "success": true,
  "message": "Provider calendar retrieved successfully",
  "data": {
    "month": "2024-12",
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "settings": {
      "id": 1,
      "providerId": 456,
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
        "id": 1,
        "providerId": 456,
        "date": "2024-12-25",
        "reason": "Christmas Holiday",
        "isRecurring": true
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden - Provider role required",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Provider not found",
  "statusCode": 404
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Time slot overlaps with existing availability",
  "statusCode": 409
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Data Models

### User Roles
- `patient`: Patient user
- `provider`: Healthcare provider

### Availability Status
- `AVAILABLE`: Slot is available for booking
- `BOOKED`: Slot has been booked
- `CANCELLED`: Slot has been cancelled

### Recurrence Patterns
- `DAILY`: Repeats every day
- `WEEKLY`: Repeats every week
- `MONTHLY`: Repeats every month

### Gender
- `MALE`: Male
- `FEMALE`: Female
- `OTHER`: Other

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute

---

## Support

For technical support or questions about the API:
- Check the health endpoints for system status
- Review error messages for specific issues
- Ensure proper authentication headers are included
- Verify request body format matches examples

---

## Version History

- **v1.0.0**: Initial release with basic and enhanced availability features
