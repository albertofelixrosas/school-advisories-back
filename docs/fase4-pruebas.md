# 🧪 **FASE 4: Pruebas de Funcionalidades Implementadas**

## 📋 Resumen de lo Implementado

### ✅ **Mejoras en Gestión de Sesiones Directas**
- ✅ Método `createDirectSession()` en AdvisoriesService
- ✅ Validaciones de permisos por materia asignada
- ✅ Validación de conflictos de horario
- ✅ Endpoint `POST /advisories/direct-session`
- ✅ DTO `CreateDirectSessionDto` con validaciones completas

### ✅ **Sistema de Registro de Asistencia Mejorado**
- ✅ Método `markBulkAttendance()` para asistencia masiva
- ✅ Método `completeSession()` para finalizar sesiones
- ✅ Método `getSessionAttendanceReport()` para reportes
- ✅ DTOs `BulkAttendanceDto` y `CompleteSessionDto`
- ✅ Endpoints mejorados en AdvisoryAttendanceController

### ✅ **Sistema de Invitación de Estudiantes**
- ✅ Entidad `StudentInvitation` con estados
- ✅ Servicio `InvitationService` completo
- ✅ DTOs de invitación con validaciones
- ✅ Controlador `StudentInvitationsController`
- ✅ Endpoints para profesores y estudiantes

---

## 🚀 **Plan de Pruebas**

### **Fase 1: Pruebas Básicas de Funcionalidad**

#### **1.1 Creación Directa de Sesiones**
```bash
# Test 1: Crear sesión directa como profesor
POST /advisories/direct-session
Headers: Authorization: Bearer <jwt_profesor>
Body: {
  "subject_detail_id": 1,
  "venue_id": 1,
  "topic": "Cálculo de Límites",
  "session_date": "2025-11-10T14:00:00.000Z",
  "max_students": 15,
  "session_link": "https://meet.google.com/abc-def",
  "schedules": [
    {
      "day": "MONDAY",
      "begin_time": "14:00",
      "end_time": "16:00"
    }
  ]
}

# Resultado esperado: 201 Created con advisory y advisory_date
```

```bash
# Test 2: Intentar crear sesión de materia no asignada
POST /advisories/direct-session
Headers: Authorization: Bearer <jwt_profesor>
Body: {
  "subject_detail_id": 999, # ID no asignado al profesor
  ...
}

# Resultado esperado: 403 Forbidden
```

#### **1.2 Registro de Asistencia Masiva**
```bash
# Test 3: Marcar asistencia múltiple
POST /advisory-attendance/session/1/bulk-attendance
Headers: Authorization: Bearer <jwt_profesor>
Body: {
  "attendances": [
    {
      "student_id": 1,
      "attended": true,
      "notes": "Participación excelente"
    },
    {
      "student_id": 2,
      "attended": false,
      "notes": "No asistió"
    }
  ]
}

# Resultado esperado: 201 Created con array de asistencias
```

#### **1.3 Sistema de Invitaciones**
```bash
# Test 4: Invitar estudiantes a sesión
POST /advisories/sessions/1/invite
Headers: Authorization: Bearer <jwt_profesor>
Body: {
  "student_ids": [1, 2, 3],
  "invitation_message": "Te invito a participar en esta asesoría",
  "expires_at": "2025-11-08T10:00:00.000Z"
}

# Resultado esperado: 201 Created con array de invitaciones
```

```bash
# Test 5: Estudiante responde a invitación
POST /student-invitations/1/respond
Headers: Authorization: Bearer <jwt_estudiante>
Body: {
  "status": "ACCEPTED",
  "response_message": "Gracias, estaré presente"
}

# Resultado esperado: 201 Created con invitación actualizada
```

### **Fase 2: Pruebas de Integración**

#### **2.1 Flujo Completo: Crear Sesión → Invitar → Asistencia**
```bash
# 1. Profesor crea sesión directa
POST /advisories/direct-session

# 2. Profesor invita estudiantes
POST /advisories/sessions/{id}/invite

# 3. Estudiantes responden invitaciones
POST /student-invitations/{id}/respond

# 4. Profesor marca asistencia
POST /advisory-attendance/session/{id}/bulk-attendance

# 5. Profesor completa sesión
PATCH /advisory-attendance/session/{id}/complete

# 6. Ver reporte final
GET /advisory-attendance/session/{id}/report
```

#### **2.2 Pruebas de Validación y Permisos**
```bash
# Test: Estudiante intenta crear sesión directa
POST /advisories/direct-session
Headers: Authorization: Bearer <jwt_estudiante>

# Resultado esperado: 403 Forbidden
```

```bash
# Test: Profesor intenta marcar asistencia de sesión ajena
POST /advisory-attendance/session/999/bulk-attendance
Headers: Authorization: Bearer <jwt_profesor_b>

# Resultado esperado: 403 Forbidden
```

### **Fase 3: Pruebas de Casos Edge**

#### **3.1 Validaciones de Fecha y Horario**
```bash
# Test: Crear sesión en el pasado
POST /advisories/direct-session
Body: {
  "session_date": "2023-01-01T10:00:00.000Z" # Fecha pasada
}

# Resultado esperado: 400 Bad Request
```

#### **3.2 Gestión de Invitaciones**
```bash
# Test: Responder invitación expirada
POST /student-invitations/1/respond
Body: {
  "status": "ACCEPTED"
}

# Resultado esperado: 400 Bad Request (si está expirada)
```

---

## 🔧 **Scripts de Prueba Automatizada**

### **Configurar Variables de Entorno**
```bash
# .env.test
PROFESSOR_JWT=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
STUDENT_JWT=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
API_BASE_URL=http://localhost:3000
```

### **Script de Pruebas con cURL**
```bash
#!/bin/bash
# test-phase4.sh

source .env.test

echo "🧪 Testing Phase 4 - Direct Sessions & Invitations"
echo "================================================"

# Test 1: Create Direct Session
echo "1️⃣ Testing Direct Session Creation..."
RESPONSE=$(curl -s -X POST "$API_BASE_URL/advisories/direct-session" \
  -H "Authorization: Bearer $PROFESSOR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "subject_detail_id": 1,
    "venue_id": 1,
    "topic": "Test Session",
    "session_date": "2025-11-10T14:00:00.000Z",
    "max_students": 10,
    "schedules": [{"day": "MONDAY", "begin_time": "14:00", "end_time": "16:00"}]
  }')

echo "Response: $RESPONSE"

# Extract advisory_date_id for next tests
ADVISORY_DATE_ID=$(echo $RESPONSE | jq -r '.advisory_date.advisory_date_id')
echo "Created session ID: $ADVISORY_DATE_ID"

# Test 2: Invite Students
echo "2️⃣ Testing Student Invitations..."
curl -s -X POST "$API_BASE_URL/advisories/sessions/$ADVISORY_DATE_ID/invite" \
  -H "Authorization: Bearer $PROFESSOR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "student_ids": [1, 2],
    "invitation_message": "Test invitation"
  }'

# Test 3: Mark Attendance
echo "3️⃣ Testing Bulk Attendance..."
curl -s -X POST "$API_BASE_URL/advisory-attendance/session/$ADVISORY_DATE_ID/bulk-attendance" \
  -H "Authorization: Bearer $PROFESSOR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "attendances": [
      {"student_id": 1, "attended": true, "notes": "Present"},
      {"student_id": 2, "attended": false, "notes": "Absent"}
    ]
  }'

echo "✅ Phase 4 tests completed!"
```

---

## 📊 **Endpoints Implementados**

### **Advisories Controller**
- `POST /advisories/direct-session` - Crear sesión directa
- `POST /advisories/sessions/:id/invite` - Invitar estudiantes
- `GET /advisories/sessions/:id/invitations` - Ver invitaciones

### **Advisory Attendance Controller**
- `POST /advisory-attendance/session/:id/bulk-attendance` - Asistencia masiva
- `PATCH /advisory-attendance/session/:id/complete` - Completar sesión
- `GET /advisory-attendance/session/:id/report` - Reporte de asistencia

### **Student Invitations Controller**
- `GET /student-invitations/my-invitations` - Ver mis invitaciones
- `POST /student-invitations/:id/respond` - Responder invitación
- `GET /student-invitations/:id` - Detalle de invitación

---

## 🎯 **Próximos Pasos**
1. **Ejecutar pruebas básicas** con Postman o cURL
2. **Validar integración** con sistema de notificaciones
3. **Proceder a Fase 5** (Epic 3 - Disponibilidad y Horarios)

---

## ✨ **Resumen del Impacto**
- ✅ **Profesores** pueden crear sesiones directamente sin esperar solicitudes
- ✅ **Sistema de invitaciones** personalizado con notificaciones
- ✅ **Registro de asistencia** eficiente y masivo
- ✅ **Reportes detallados** de cada sesión
- ✅ **Validaciones robustas** de permisos y horarios