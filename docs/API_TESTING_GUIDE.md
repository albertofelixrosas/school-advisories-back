# API Testing Guide - New Endpoints

This guide provides curl commands and examples for testing all newly implemented endpoints.

## Prerequisites

1. **Get JWT Token:**
```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_username",
    "password": "admin_password"
  }'

# Response includes access_token
# Export it for convenience:
export TOKEN="your_access_token_here"
```

---

## Phase 1: Critical Endpoints

### 1. Admin Dashboard Statistics

**GET /users/admin/dashboard/stats**

```bash
curl -X GET http://localhost:3000/users/admin/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "users": {
    "total": 150,
    "students": 120,
    "professors": 25,
    "admins": 5,
    "recent_registrations": 12
  },
  "advisories": {
    "total": 45,
    "active": 30,
    "completed": 15,
    "avg_students_per_session": 8.5
  },
  "sessions": {
    "total": 120,
    "upcoming": 35,
    "completed": 85,
    "this_week": 8,
    "this_month": 25
  },
  "requests": {
    "total": 200,
    "pending": 15,
    "approved": 150,
    "rejected": 35,
    "avg_response_time_hours": 24.5
  },
  "attendance": {
    "total_records": 680,
    "attended": 612,
    "attendance_rate": 90.0
  },
  "subjects": {
    "total": 20,
    "with_professors": 18,
    "active_advisories": 30
  },
  "top_subjects": [
    {
      "subject_id": 1,
      "subject_name": "Cálculo Diferencial",
      "sessions_count": 25,
      "students_served": 180
    }
  ],
  "top_professors": [
    {
      "user_id": 10,
      "name": "Juan",
      "last_name": "Pérez",
      "sessions_count": 30,
      "students_served": 250,
      "avg_rating": 0
    }
  ]
}
```

### 2. Session Students List

**GET /advisories/sessions/:sessionId/students**

```bash
# Replace :sessionId with actual advisory_date_id
curl -X GET http://localhost:3000/advisories/sessions/1/students \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "session": {
    "advisory_date_id": 1,
    "advisory_id": 5,
    "topic": "Derivadas y límites",
    "date": "2024-01-15T10:00:00Z",
    "notes": "Traer calculadora",
    "session_link": "https://meet.google.com/abc-defg-hij",
    "venue": {
      "venue_id": 3,
      "building": "Edificio 3",
      "classroom": "Aula 301",
      "capacity": 0
    },
    "subject": {
      "subject_id": 1,
      "subject_name": "Cálculo Diferencial"
    },
    "professor": {
      "user_id": 10,
      "name": "Juan",
      "last_name": "Pérez",
      "email": "juan.perez@itson.edu.mx",
      "photo_url": "https://example.com/photo.jpg"
    },
    "max_students": 15,
    "completed_at": null
  },
  "students": [
    {
      "user_id": 50,
      "student_id": "00000123456",
      "name": "María",
      "last_name": "González",
      "email": "maria.gonzalez@itson.edu.mx",
      "photo_url": null,
      "phone_number": "+526441234567",
      "attended": true,
      "attendance_notes": "Participación activa",
      "join_type": "attendance"
    }
  ],
  "total_students": 12,
  "attended_count": 10,
  "absent_count": 2,
  "attendance_rate": 83.33
}
```

---

## Phase 2: Important Endpoints

### 3. Subject Details Toggle Status

**PATCH /subject-details/:id/toggle-status**

```bash
# Toggle status of subject detail assignment
curl -X PATCH http://localhost:3000/subject-details/5/toggle-status \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "subject_detail_id": 5,
  "subject_id": 1,
  "professor_id": 10,
  "is_active": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "subject": {
    "subject_id": 1,
    "subject": "Cálculo Diferencial"
  },
  "professor": {
    "user_id": 10,
    "name": "Juan",
    "last_name": "Pérez"
  },
  "schedules": [
    {
      "subject_schedule_id": 1,
      "day": "MONDAY",
      "start_time": "08:00",
      "end_time": "10:00"
    }
  ]
}
```

**Verify Status Change:**
```bash
curl -X GET http://localhost:3000/subject-details/5 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Phase 3: Enhancement Endpoints

### 4. Full Session Details

**GET /advisories/sessions/:sessionId**

```bash
curl -X GET http://localhost:3000/advisories/sessions/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "advisory_date_id": 1,
  "advisory_id": 5,
  "topic": "Derivadas y límites",
  "date": "2024-01-15T10:00:00Z",
  "notes": "Traer calculadora",
  "session_link": "https://meet.google.com/abc-defg-hij",
  "completed_at": null,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-10T15:30:00.000Z",
  "venue": {
    "venue_id": 3,
    "building": "Edificio 3",
    "classroom": "Aula 301",
    "capacity": 0
  },
  "subject": {
    "subject_id": 1,
    "subject_name": "Cálculo Diferencial",
    "schedules": [
      {
        "day": "MONDAY",
        "start_time": "08:00",
        "end_time": "10:00"
      }
    ]
  },
  "professor": {
    "user_id": 10,
    "name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@itson.edu.mx",
    "photo_url": "https://example.com/photo.jpg",
    "phone_number": "+526441234567"
  },
  "max_students": 15,
  "advisory_schedules": [
    {
      "advisory_schedule_id": 1,
      "day": "MONDAY",
      "begin_time": "10:00",
      "end_time": "12:00"
    }
  ],
  "attendances": [
    {
      "student_id": 50,
      "student_enrollment_id": "00000123456",
      "student_name": "María",
      "student_last_name": "González",
      "attended": true,
      "notes": "Participación activa"
    }
  ],
  "registered_students_count": 12,
  "attended_count": 10,
  "attendance_rate": 83.33,
  "is_completed": false,
  "is_upcoming": true
}
```

### 5. Email Templates Management

#### a) List All Templates

**GET /notifications/templates**

```bash
curl -X GET http://localhost:3000/notifications/templates \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
[
  {
    "template_id": 1,
    "template_key": "advisory_request_new",
    "template_name": "Nueva Solicitud de Asesoría",
    "subject": "Nueva solicitud de asesoría - {{student_name}}",
    "html_content": "<h2>Nueva Solicitud de Asesoría</h2>...",
    "text_content": "Nueva solicitud...",
    "variables": {
      "student_name": "Student name",
      "professor_name": "Professor name"
    },
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### b) Get Specific Template

**GET /notifications/templates/:key**

```bash
curl -X GET http://localhost:3000/notifications/templates/advisory_request_new \
  -H "Authorization: Bearer $TOKEN"
```

#### c) Create New Template

**POST /notifications/templates**

```bash
curl -X POST http://localhost:3000/notifications/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_key": "custom_reminder",
    "template_name": "Recordatorio Personalizado",
    "subject": "Recordatorio - {{event_name}}",
    "html_content": "<h1>Hola {{student_name}}</h1><p>Tienes un evento: {{event_name}} el {{event_date}}</p>",
    "text_content": "Recordatorio de {{event_name}} el {{event_date}}",
    "variables": {
      "student_name": "Nombre del estudiante",
      "event_name": "Nombre del evento",
      "event_date": "Fecha del evento"
    },
    "is_active": true
  }'
```

**Expected Response:**
```json
{
  "template_id": 10,
  "template_key": "custom_reminder",
  "template_name": "Recordatorio Personalizado",
  "subject": "Recordatorio - {{event_name}}",
  "html_content": "<h1>Hola {{student_name}}</h1>...",
  "text_content": "Recordatorio de {{event_name}}...",
  "variables": {
    "student_name": "Nombre del estudiante",
    "event_name": "Nombre del evento",
    "event_date": "Fecha del evento"
  },
  "is_active": true,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### d) Update Template

**PATCH /notifications/templates/:key**

```bash
curl -X PATCH http://localhost:3000/notifications/templates/custom_reminder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Recordatorio Urgente - {{event_name}}",
    "html_content": "<h1 style=\"color: red;\">¡URGENTE!</h1><p>{{event_name}} el {{event_date}}</p>"
  }'
```

#### e) Toggle Template Status

**PATCH /notifications/templates/:key/toggle**

```bash
curl -X PATCH http://localhost:3000/notifications/templates/custom_reminder/toggle \
  -H "Authorization: Bearer $TOKEN"
```

#### f) Delete Template

**DELETE /notifications/templates/:key**

```bash
curl -X DELETE http://localhost:3000/notifications/templates/custom_reminder \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** 204 No Content

---

## Testing Scenarios

### Scenario 1: Admin Dashboard Overview
```bash
# 1. Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}' > token.json

# 2. Extract token
export TOKEN=$(cat token.json | jq -r '.access_token')

# 3. Get dashboard stats
curl -X GET http://localhost:3000/users/admin/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Scenario 2: Professor Managing Session Students
```bash
# 1. Login as professor
export TOKEN="professor_token"

# 2. Get all sessions for professor
curl -X GET http://localhost:3000/advisories/professor/10 \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Get students for specific session
curl -X GET http://localhost:3000/advisories/sessions/1/students \
  -H "Authorization: Bearer $TOKEN" | jq '.students'

# 4. Get full session details
curl -X GET http://localhost:3000/advisories/sessions/1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Scenario 3: Admin Managing Subject Assignments
```bash
# 1. List all subject details
curl -X GET http://localhost:3000/subject-details \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Toggle specific assignment status
curl -X PATCH http://localhost:3000/subject-details/5/toggle-status \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Verify status changed
curl -X GET http://localhost:3000/subject-details/5 \
  -H "Authorization: Bearer $TOKEN" | jq '.is_active'
```

### Scenario 4: Admin Customizing Email Templates
```bash
# 1. List all templates
curl -X GET http://localhost:3000/notifications/templates \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Create custom template
curl -X POST http://localhost:3000/notifications/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @new_template.json | jq

# 3. Update template
curl -X PATCH http://localhost:3000/notifications/templates/custom_template \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject": "Updated Subject"}' | jq

# 4. Toggle template status
curl -X PATCH http://localhost:3000/notifications/templates/custom_template/toggle \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Error Cases

### Test 404 - Session Not Found
```bash
curl -X GET http://localhost:3000/advisories/sessions/99999/students \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 Not Found
```

### Test 403 - Unauthorized (Non-admin trying admin endpoint)
```bash
# Login as student/professor
export STUDENT_TOKEN="student_token"

curl -X POST http://localhost:3000/notifications/templates \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Expected: 403 Forbidden
```

### Test 401 - No Token
```bash
curl -X GET http://localhost:3000/users/admin/dashboard/stats
# Expected: 401 Unauthorized
```

---

## Automated Testing Script

Create a file `test_endpoints.sh`:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:3000"
ADMIN_USER="admin"
ADMIN_PASS="password"

# Login and get token
echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"

# Test 1: Dashboard Stats
echo "📊 Testing dashboard stats..."
curl -s -X GET "$API_URL/users/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.users.total' > /dev/null
echo "✅ Dashboard stats OK"

# Test 2: Session Students
echo "👨‍🎓 Testing session students..."
curl -s -X GET "$API_URL/advisories/sessions/1/students" \
  -H "Authorization: Bearer $TOKEN" | jq '.total_students' > /dev/null
echo "✅ Session students OK"

# Test 3: Subject Toggle
echo "📚 Testing subject toggle..."
curl -s -X PATCH "$API_URL/subject-details/1/toggle-status" \
  -H "Authorization: Bearer $TOKEN" | jq '.is_active' > /dev/null
echo "✅ Subject toggle OK"

# Test 4: Full Session Details
echo "📝 Testing full session details..."
curl -s -X GET "$API_URL/advisories/sessions/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.is_upcoming' > /dev/null
echo "✅ Full session details OK"

# Test 5: Email Templates
echo "📧 Testing email templates..."
curl -s -X GET "$API_URL/notifications/templates" \
  -H "Authorization: Bearer $TOKEN" | jq 'length' > /dev/null
echo "✅ Email templates OK"

echo ""
echo "🎉 All tests passed!"
```

Run with:
```bash
chmod +x test_endpoints.sh
./test_endpoints.sh
```

---

## Notes

- Replace `localhost:3000` with your actual API URL
- All timestamps are in ISO 8601 format
- All dates are stored in UTC
- Admin endpoints require JWT token with admin role
- Some endpoints are accessible to professors and students as well

---

## Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3000/api
```

This provides:
- Complete endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication setup
