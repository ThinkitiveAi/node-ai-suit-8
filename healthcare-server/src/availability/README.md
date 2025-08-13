# Provider Availability Module

A comprehensive module for managing healthcare provider availability and appointment scheduling.

## Features

- ✅ **Create Availability Slots**: Providers can set their available time slots
- ✅ **Recurring Appointments**: Support for daily, weekly, and monthly recurring slots
- ✅ **Bulk Operations**: Create multiple slots in a single request
- ✅ **Smart Validation**: Prevents overlapping slots and past date scheduling
- ✅ **Timezone Support**: Store in UTC, convert based on user timezone
- ✅ **Advanced Search**: Patients can search by date, time, specialization, and location
- ✅ **Database Optimization**: Indexed queries for fast retrieval
- ✅ **Role-based Access**: Provider-only creation/editing, public search

## API Endpoints

### Provider Endpoints (Requires Authentication)

#### Create Availability Slot
```http
POST /api/v1/provider/availability
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "maxAppointments": 1,
  "isRecurring": false,
  "timezone": "America/New_York",
  "notes": "General consultations"
}
```

#### Create Multiple Slots (Bulk)
```http
POST /api/v1/provider/availability/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "slots": [
    {
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    {
      "date": "2024-01-16",
      "startTime": "14:00",
      "endTime": "17:00"
    }
  ]
}
```

#### Create Recurring Slots
```http
POST /api/v1/provider/availability
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "isRecurring": true,
  "recurrencePattern": "WEEKLY",
  "recurrenceEndDate": "2024-12-31",
  "slotDuration": 30
}
```

#### Get My Availability
```http
GET /api/v1/provider/availability/my?page=1&limit=20&date=2024-01-15
Authorization: Bearer {token}
```

#### Update Availability Slot
```http
PUT /api/v1/provider/availability/{slotId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "startTime": "10:00",
  "status": "AVAILABLE",
  "notes": "Updated consultation hours"
}
```

#### Delete Availability Slot
```http
DELETE /api/v1/provider/availability/{slotId}
Authorization: Bearer {token}
```

### Public Endpoints (No Authentication Required)

#### Search Available Providers
```http
GET /api/v1/availability/search?date=2024-01-15&specialization=Cardiology&city=New York&page=1&limit=20
```

#### Get Provider's Availability
```http
GET /api/v1/provider/{providerId}/availability?startDate=2024-01-15&endDate=2024-01-31
```

## Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `date` | string | Specific date (YYYY-MM-DD) | `2024-01-15` |
| `startDate` | string | Date range start | `2024-01-15` |
| `endDate` | string | Date range end | `2024-01-31` |
| `startTime` | string | Time range start (HH:mm) | `09:00` |
| `endTime` | string | Time range end (HH:mm) | `17:00` |
| `specialization` | string | Provider specialization | `Cardiology` |
| `city` | string | Provider clinic city | `New York` |
| `state` | string | Provider clinic state | `NY` |
| `status` | enum | Slot status | `AVAILABLE` |
| `minDuration` | number | Minimum slot duration (minutes) | `30` |
| `page` | number | Page number for pagination | `1` |
| `limit` | number | Results per page (1-100) | `20` |
| `timezone` | string | User timezone | `America/New_York` |

## Data Models

### ProviderAvailability Schema
```typescript
{
  id: string;                    // UUID
  providerId: string;            // Foreign key to Provider
  date: string;                  // YYYY-MM-DD format
  startTime: string;             // HH:mm format
  endTime: string;               // HH:mm format
  isRecurring: boolean;          // Default: false
  recurrencePattern?: "DAILY" | "WEEKLY" | "MONTHLY";
  recurrenceEndDate?: string;    // YYYY-MM-DD format
  slotDuration: number;          // Minutes, default: 30
  status: "AVAILABLE" | "BOOKED" | "CANCELLED" | "BLOCKED";
  maxAppointments: number;       // Default: 1
  currentAppointments: number;   // Default: 0
  notes?: string;               // Optional notes
  timezone: string;             // Default: "UTC"
  createdAt: Date;
  updatedAt: Date;
}
```

## Business Rules

### Validation Rules
- ✅ **Future Dates Only**: Cannot create availability for past dates
- ✅ **Valid Time Range**: End time must be after start time
- ✅ **Minimum Duration**: Slots must be at least 15 minutes
- ✅ **No Overlaps**: Prevents overlapping time slots for the same provider
- ✅ **Time Format**: Uses 24-hour HH:mm format
- ✅ **Appointment Limits**: Current appointments cannot exceed maximum

### Recurring Slots
- **Daily**: Creates slots every day until end date
- **Weekly**: Creates slots every week on the same day
- **Monthly**: Creates slots every month on the same date
- **Conflict Handling**: Skips conflicting slots, logs warnings

### Access Control
- **Providers**: Can create, read, update, delete their own slots
- **Patients**: Can search and view available slots (read-only)
- **Authorization**: JWT token required for provider operations

## Error Handling

### Common Error Responses

```json
// Bad Request (400)
{
  "success": false,
  "message": "End time must be after start time",
  "error": "Bad Request"
}

// Conflict (409)
{
  "success": false,
  "message": "Time slot overlaps with existing availability from 08:00 to 12:00",
  "error": "Conflict"
}

// Forbidden (403)
{
  "success": false,
  "message": "You can only update your own availability slots",
  "error": "Forbidden"
}

// Not Found (404)
{
  "success": false,
  "message": "Availability slot not found",
  "error": "Not Found"
}
```

## Database Schema

### Table: provider_availability
```sql
CREATE TABLE provider_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(10) CHECK (recurrence_pattern IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  recurrence_end_date DATE,
  slot_duration INTEGER DEFAULT 30,
  status VARCHAR(10) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'CANCELLED', 'BLOCKED')),
  max_appointments INTEGER DEFAULT 1,
  current_appointments INTEGER DEFAULT 0,
  notes TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(provider_id, date, start_time, end_time)
);

-- Indexes for performance
CREATE INDEX idx_availability_date_status ON provider_availability(date, status);
CREATE INDEX idx_availability_provider_date ON provider_availability(provider_id, date);
CREATE INDEX idx_availability_search ON provider_availability(date, start_time, end_time, status);
```

## Usage Examples

### Provider Creating Weekly Recurring Slots
```javascript
// Provider wants to be available every Monday 9-5 for 3 months
const recurringSlot = {
  date: "2024-01-15", // First Monday
  startTime: "09:00",
  endTime: "17:00",
  isRecurring: true,
  recurrencePattern: "WEEKLY",
  recurrenceEndDate: "2024-04-15",
  slotDuration: 30,
  timezone: "America/New_York"
};
```

### Patient Searching for Cardiologist
```javascript
// Patient looking for available cardiologist in New York next week
const searchQuery = {
  specialization: "Cardiology",
  city: "New York",
  startDate: "2024-01-22",
  endDate: "2024-01-28",
  status: "AVAILABLE",
  page: 1,
  limit: 10
};
```

## Testing

### Running Tests
```bash
# Unit tests
npm test src/availability/availability.service.spec.ts

# Integration tests  
npm test src/availability/availability.controller.spec.ts

# All availability tests
npm test -- src/availability
```

### Test Coverage
- ✅ Service layer business logic
- ✅ API endpoint integration
- ✅ Validation and error handling
- ✅ Database operations
- ✅ Authentication and authorization

## Performance Considerations

### Database Optimization
- **Composite Index**: `(provider_id, date, start_time, end_time)` for unique constraint
- **Search Index**: `(date, start_time, end_time, status)` for fast lookups
- **Provider Index**: `(provider_id, date)` for provider-specific queries

### Query Optimization
- **Pagination**: Limits result sets for large datasets
- **Selective Filtering**: Early WHERE clause filtering
- **Index Usage**: All search queries use appropriate indexes

### Timezone Handling
- **Storage**: All times stored in UTC
- **Conversion**: Client-side conversion to user timezone
- **API**: Accepts timezone parameter for proper conversion

## Future Enhancements

- [ ] **Appointment Booking**: Integration with appointment scheduling
- [ ] **Waitlist Management**: Queue patients for cancelled slots  
- [ ] **Email Notifications**: Notify patients of availability changes
- [ ] **Calendar Integration**: Sync with external calendar systems
- [ ] **Advanced Recurrence**: Custom recurrence patterns
- [ ] **Slot Templates**: Save and reuse common availability patterns
 