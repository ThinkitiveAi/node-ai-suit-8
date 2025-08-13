# Comprehensive Availability API Demo

This document demonstrates how to use the new enhanced availability API that matches your UI mockups.

## 🚀 Overview

The enhanced availability system now supports:
- **Day-based scheduling** with multiple time slots per day
- **Virtual/Physical location** settings
- **Provider settings** (booking windows, consultation times, etc.)
- **Block days** for unavailable periods
- **Recurring availability** patterns

## 📋 API Endpoints

### 1. Create Comprehensive Availability

This endpoint matches your "Add Availability" UI form:

```http
POST /api/v1/provider/availability/comprehensive
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "daySlots": [
    {
      "dayOfWeek": "MONDAY",
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00",
          "location": "Room 101, Main Clinic",
          "isVirtual": false
        },
        {
          "startTime": "14:00",
          "endTime": "17:00",
          "location": "Virtual",
          "isVirtual": true
        }
      ]
    },
    {
      "dayOfWeek": "TUESDAY",
      "timeSlots": [
        {
          "startTime": "10:00",
          "endTime": "15:00",
          "location": "Room 102, Main Clinic",
          "isVirtual": false
        }
      ]
    }
  ],
  "blockDays": [
    {
      "date": "2024-02-15",
      "isFullDay": true,
      "reason": "Conference Day"
    },
    {
      "date": "2024-02-20",
      "isFullDay": false,
      "startTime": "14:00",
      "endTime": "16:00",
      "reason": "Personal appointment"
    }
  ],
  "settings": {
    "bookingWindowDays": 30,
    "bookingWindowType": "DAYS",
    "timezone": "America/New_York",
    "newAppointmentDuration": 30,
    "followUpAppointmentDuration": 15,
    "minimumNoticeAmount": 2,
    "minimumNoticeType": "HOURS",
    "eventBufferMinutes": 15
  },
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "isRecurring": true
}
```

### 2. Provider Settings Management

#### Get Provider Settings
```http
GET /api/v1/provider/settings/availability
Authorization: Bearer {your_jwt_token}
```

#### Create/Update Provider Settings
```http
POST /api/v1/provider/settings/availability
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "bookingWindowDays": 30,
  "bookingWindowType": "DAYS",
  "timezone": "IST",
  "newAppointmentDuration": 30,
  "followUpAppointmentDuration": 15,
  "minimumNoticeAmount": 2,
  "minimumNoticeType": "HOURS",
  "eventBufferMinutes": 15
}
```

### 3. Block Days Management

#### Get Block Days
```http
GET /api/v1/provider/block-days?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {your_jwt_token}
```

#### Create Single Block Day
```http
POST /api/v1/provider/block-days
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "date": "2024-02-15",
  "isFullDay": true,
  "reason": "Personal day off"
}
```

#### Create Partial Day Block
```http
POST /api/v1/provider/block-days
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "date": "2024-02-16",
  "isFullDay": false,
  "startTime": "14:00",
  "endTime": "16:00",
  "reason": "Medical appointment"
}
```

### 4. Enhanced Provider Information

#### Get Provider Calendar View
```http
GET /api/v1/availability/calendar/{providerId}?month=2024-01
```

## 🎯 UI Form Mapping

### Main Availability Form
Your UI form maps to the API as follows:

| UI Field | API Field | Example |
|----------|-----------|---------|
| Provider Dropdown | `providerId` (auto-filled from JWT) | - |
| Day Selection | `daySlots[].dayOfWeek` | "MONDAY" |
| Start Time | `daySlots[].timeSlots[].startTime` | "09:00" |
| End Time | `daySlots[].timeSlots[].endTime` | "17:00" |
| Location | `daySlots[].timeSlots[].location` | "Room 101" |
| Virtual Checkbox | `daySlots[].timeSlots[].isVirtual` | true/false |

### Slot Creation Settings
| UI Field | API Field | Example |
|----------|-----------|---------|
| Booking Window | `settings.bookingWindowDays` | 30 |
| Time Zone | `settings.timezone` | "IST" |

### Block Days
| UI Field | API Field | Example |
|----------|-----------|---------|
| Day | `blockDays[].date` | "2024-01-15" |
| Full Day Block | `blockDays[].isFullDay` | true |
| Start Time | `blockDays[].startTime` | "14:00" |
| End Time | `blockDays[].endTime` | "16:00" |

### Availability Settings
| UI Field | API Field | Example |
|----------|-----------|---------|
| New Appointment Duration | `settings.newAppointmentDuration` | 30 (minutes) |
| Follow-up Duration | `settings.followUpAppointmentDuration` | 15 (minutes) |
| Minimum Notice | `settings.minimumNoticeAmount` + `settings.minimumNoticeType` | 2 HOURS |
| Event Buffer | `settings.eventBufferMinutes` | 15 (minutes) |

## 🧪 Testing Examples

### Example 1: Doctor with Morning and Evening Slots
```bash
curl -X POST http://localhost:3000/api/v1/provider/availability/comprehensive \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "daySlots": [
      {
        "dayOfWeek": "MONDAY",
        "timeSlots": [
          {
            "startTime": "09:00",
            "endTime": "12:00",
            "location": "Main Clinic",
            "isVirtual": false
          },
          {
            "startTime": "18:00",
            "endTime": "20:00",
            "location": "Virtual",
            "isVirtual": true
          }
        ]
      }
    ],
    "settings": {
      "newAppointmentDuration": 30,
      "followUpAppointmentDuration": 15,
      "eventBufferMinutes": 10
    },
    "isRecurring": true
  }'
```

### Example 2: Block Vacation Days
```bash
curl -X POST http://localhost:3000/api/v1/provider/block-days/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "blockDays": [
      {
        "date": "2024-03-15",
        "isFullDay": true,
        "reason": "Vacation - Day 1"
      },
      {
        "date": "2024-03-16",
        "isFullDay": true,
        "reason": "Vacation - Day 2"
      }
    ]
  }'
```

## 🔄 Workflow Integration

### Complete Setup Workflow
1. **Set Provider Settings** → POST `/provider/settings/availability`
2. **Create Weekly Schedule** → POST `/provider/availability/comprehensive`
3. **Add Block Days** → POST `/provider/block-days`
4. **Get Calendar View** → GET `/availability/calendar/{providerId}`

### Frontend Integration
Your React/Vue components can use these endpoints to:
- Populate the provider dropdown
- Handle day/time slot creation
- Manage block days
- Configure provider settings
- Display availability calendar

## 🎉 Success!

Your availability system now supports all the features shown in your UI mockups:
- ✅ Day-based slot creation
- ✅ Multiple time slots per day
- ✅ Virtual/Physical location options
- ✅ Comprehensive provider settings
- ✅ Block days management
- ✅ Event buffer and scheduling rules
- ✅ Booking window controls
- ✅ Minimum notice requirements

The API is fully functional and ready for your frontend integration! 