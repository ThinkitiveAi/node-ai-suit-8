# Appointment Module

This module handles appointment scheduling and management for the Health First application.

## Features

- Create new appointments
- Retrieve appointments with pagination and filtering
- Update appointment details
- Update appointment status
- Delete appointments
- Conflict detection for scheduling
- Validation for past dates

## API Endpoints

### Create Appointment
- **POST** `/appointments`
- **Body**: `CreateAppointmentDto`
- **Roles**: `patient`, `provider`

### Get All Appointments
- **GET** `/appointments`
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `patientId` (optional): Filter by patient UUID
  - `providerId` (optional): Filter by provider UUID
  - `status` (optional): Filter by appointment status
- **Roles**: `patient`, `provider`

### Get Appointment by UUID
- **GET** `/appointments/:uuid`
- **Roles**: `patient`, `provider`

### Update Appointment
- **PATCH** `/appointments/:uuid`
- **Body**: `UpdateAppointmentDto`
- **Roles**: `patient`, `provider`

### Update Appointment Status
- **PATCH** `/appointments/:uuid/status`
- **Body**: `{ status: AppointmentStatus }`
- **Roles**: `provider`

### Delete Appointment
- **DELETE** `/appointments/:uuid`
- **Roles**: `patient`, `provider`

## Data Models

### CreateAppointmentDto
```typescript
{
  patientId: string;           // Patient UUID
  providerId: string;          // Provider UUID
  appointmentType: string;     // Type of appointment
  appointmentMode: AppointmentMode; // IN_PERSON, VIDEO_CALL, HOME
  scheduledDate: string;       // ISO date string
  estimatedAmount: number;     // Amount in dollars
  reasonForVisit?: string;     // Optional reason
  notes?: string;              // Optional notes
}
```

### AppointmentResponseDto
```typescript
{
  uuid: string;
  patientId: string;
  providerId: string;
  appointmentType: string;
  appointmentMode: string;
  scheduledDate: Date;
  estimatedAmount: number;
  reasonForVisit?: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Appointment Modes
- `IN_PERSON`: Physical appointment at clinic
- `VIDEO_CALL`: Virtual appointment via video call
- `HOME`: Home visit appointment

## Appointment Statuses
- `SCHEDULED`: Appointment is scheduled
- `CONFIRMED`: Appointment is confirmed
- `IN_PROGRESS`: Appointment is currently happening
- `COMPLETED`: Appointment is completed
- `CANCELLED`: Appointment is cancelled
- `NO_SHOW`: Patient did not show up

## Business Rules

1. **Conflict Detection**: Cannot schedule appointments that conflict with existing ones
2. **Past Date Validation**: Cannot schedule appointments in the past
3. **Status Restrictions**: Cannot update completed or cancelled appointments
4. **Deletion Restrictions**: Cannot delete completed appointments
5. **Patient/Provider Validation**: Must provide valid patient and provider UUIDs

## Error Handling

- `NotFoundException`: Patient, provider, or appointment not found
- `ConflictException`: Scheduling conflict detected
- `BadRequestException`: Invalid data or business rule violation
- `ValidationException`: Invalid input data format

## Database Schema

The appointment data is stored in the `appointments` table with the following structure:

- `id`: Auto-increment primary key
- `uuid`: Unique UUID for external references
- `patientId`: Foreign key to patients table
- `providerId`: Foreign key to providers table
- `appointmentType`: Type of appointment
- `appointmentMode`: Mode of appointment (enum)
- `scheduledDate`: Scheduled date and time
- `estimatedAmount`: Estimated cost
- `reasonForVisit`: Optional reason for visit
- `status`: Current status (enum)
- `notes`: Optional notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp 