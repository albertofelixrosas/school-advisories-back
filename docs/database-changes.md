# Cambios Necesarios en Base de Datos

## 📋 Resumen
Este documento detalla las modificaciones necesarias en el esquema actual para soportar las historias de usuario definidas.

---

## 🆕 Nuevas Entidades

### 1. AdvisoryRequest (Solicitudes de Asesoría)
Nueva entidad para manejar el flujo de solicitud → aprobación → sesión.

```sql
CREATE TABLE advisory_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_detail_id UUID NOT NULL REFERENCES subject_details(id) ON DELETE CASCADE,
  
  -- Detalles de la solicitud
  topic VARCHAR(200) NOT NULL,
  message TEXT,
  preferred_venue_type VARCHAR(20) CHECK (preferred_venue_type IN ('PHYSICAL', 'VIRTUAL')),
  preferred_schedule_slot_id UUID REFERENCES advisory_schedules(id),
  
  -- Estado y respuesta
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  rejection_reason TEXT,
  response_message TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  responded_by_id UUID REFERENCES users(id)
);

CREATE INDEX idx_advisory_requests_student ON advisory_requests(student_id);
CREATE INDEX idx_advisory_requests_subject_detail ON advisory_requests(subject_detail_id);
CREATE INDEX idx_advisory_requests_status ON advisory_requests(status);
```

### 2. NotificationPreferences (Preferencias de Notificación)
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipos de notificación
  advisory_requests_received VARCHAR(20) DEFAULT 'IMMEDIATE' 
    CHECK (advisory_requests_received IN ('IMMEDIATE', 'DAILY', 'OFF')),
  request_responses VARCHAR(20) DEFAULT 'IMMEDIATE' 
    CHECK (request_responses IN ('IMMEDIATE', 'OFF')),
  cancellations VARCHAR(20) DEFAULT 'IMMEDIATE' 
    CHECK (cancellations IN ('IMMEDIATE', 'OFF')),
  reminders VARCHAR(20) DEFAULT 'BOTH' 
    CHECK (reminders IN ('24H', '1H', 'BOTH', 'OFF')),
  weekly_reports VARCHAR(20) DEFAULT 'OFF' 
    CHECK (weekly_reports IN ('WEEKLY', 'OFF')),
  
  -- Configuración adicional
  alternative_email VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);
```

### 3. NotificationLogs (Logs de Notificaciones)
```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Detalles del email
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  
  -- Estado de entrega
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'RETRY')),
  provider_message_id VARCHAR(255),
  error_message TEXT,
  
  -- Referencias opcionales
  advisory_request_id UUID REFERENCES advisory_requests(id),
  advisory_date_id UUID REFERENCES advisory_dates(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0
);

CREATE INDEX idx_notification_logs_recipient ON notification_logs(recipient_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_type ON notification_logs(email_type);
```

### 4. EmailTemplates (Plantillas de Email)
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  
  -- Variables disponibles (JSON array)
  available_variables JSON,
  
  -- Configuración
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- No editable por admin
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_id UUID REFERENCES users(id)
);

-- Insertar plantillas por defecto
INSERT INTO email_templates (template_key, name, subject_template, body_template, is_system) VALUES
('advisory_request_new', 'Nueva Solicitud de Asesoría', 
 'Nueva solicitud de asesoría - {{subjectName}} - {{studentName}}',
 '<h2>Nueva solicitud de asesoría</h2><p>El estudiante {{studentName}} ha solicitado asesoría...</p>',
 true),
('advisory_request_approved', 'Solicitud Aprobada',
 '✅ Asesoría confirmada - {{subjectName}} - {{date}}',
 '<h2>¡Tu solicitud ha sido aprobada!</h2><p>Detalles de la asesoría...</p>',
 true);
```

---

## 🔄 Modificaciones a Entidades Existentes

### 1. Advisory (Renombrar a AdvisorySession)
Agregar campos para mejor gestión de sesiones:

```sql
-- Agregar nuevas columnas a la tabla advisory
ALTER TABLE advisory ADD COLUMN status VARCHAR(20) DEFAULT 'SCHEDULED' 
  CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'));

ALTER TABLE advisory ADD COLUMN max_students INTEGER DEFAULT 1;
ALTER TABLE advisory ADD COLUMN created_by_id UUID REFERENCES users(id);
ALTER TABLE advisory ADD COLUMN cancelled_by_id UUID REFERENCES users(id);
ALTER TABLE advisory ADD COLUMN cancelled_at TIMESTAMP;
ALTER TABLE advisory ADD COLUMN notes TEXT;
ALTER TABLE advisory ADD COLUMN session_link VARCHAR(500); -- Para URLs de Meet/Zoom

-- Índices para mejor performance
CREATE INDEX idx_advisory_status ON advisory(status);
CREATE INDEX idx_advisory_created_by ON advisory(created_by_id);
```

### 2. AdvisoryDate (Renombrar a AdvisorySession)
```sql
-- Agregar campos faltantes
ALTER TABLE advisory_dates ADD COLUMN notes TEXT;
ALTER TABLE advisory_dates ADD COLUMN session_link VARCHAR(500);
ALTER TABLE advisory_dates ADD COLUMN completed_at TIMESTAMP;
ALTER TABLE advisory_dates ADD COLUMN created_by_id UUID REFERENCES users(id);

-- Relación con solicitud original (opcional)
ALTER TABLE advisory_dates ADD COLUMN advisory_request_id UUID REFERENCES advisory_requests(id);
```

### 3. AdvisorySchedule (Renombrar a ProfessorAvailability)
```sql
-- Mejor gestión de disponibilidad
ALTER TABLE advisory_schedules ADD COLUMN max_students_per_slot INTEGER DEFAULT 1;
ALTER TABLE advisory_schedules ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE advisory_schedules ADD COLUMN venue_preference VARCHAR(20) 
  CHECK (venue_preference IN ('PHYSICAL', 'VIRTUAL', 'BOTH'));
```

### 4. Venue
```sql
-- Capacidad y configuración adicional
ALTER TABLE venues ADD COLUMN capacity INTEGER;
ALTER TABLE venues ADD COLUMN meeting_url VARCHAR(500); -- Para venues virtuales permanentes
ALTER TABLE venues ADD COLUMN instructions TEXT; -- Indicaciones adicionales
```

### 5. User
```sql
-- Campos adicionales para auditoría y configuración
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Mexico_City';
```

---

## 🔄 Relaciones Nuevas y Modificadas

### 1. Flujo de Solicitud → Sesión
```
Student → AdvisoryRequest → AdvisoryDate (cuando se aprueba)
                         ↓
                    AdvisoryAttendance
```

### 2. Auditoría Completa
Todas las entidades principales deben tener:
- `created_by_id` (quién creó)
- `updated_by_id` (quién modificó por última vez)
- `created_at` y `updated_at` (automáticos)

---

## 📊 Vistas y Consultas Útiles

### 1. Vista: Solicitudes Pendientes por Profesor
```sql
CREATE VIEW professor_pending_requests AS
SELECT 
  ar.id,
  ar.topic,
  ar.message,
  ar.created_at,
  s.name as student_name,
  s.email as student_email,
  subj.name as subject_name,
  prof.name as professor_name
FROM advisory_requests ar
JOIN users s ON ar.student_id = s.id
JOIN subject_details sd ON ar.subject_detail_id = sd.id
JOIN subjects subj ON sd.subject_id = subj.id
JOIN users prof ON sd.professor_id = prof.id
WHERE ar.status = 'PENDING'
ORDER BY ar.created_at ASC;
```

### 2. Vista: Dashboard Métricas
```sql
CREATE VIEW dashboard_metrics AS
SELECT 
  COUNT(CASE WHEN ar.status = 'PENDING' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN ar.status = 'APPROVED' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN ad.status = 'COMPLETED' THEN 1 END) as completed_sessions,
  ROUND(
    COUNT(CASE WHEN aa.attended = true THEN 1 END) * 100.0 / 
    NULLIF(COUNT(aa.id), 0), 2
  ) as attendance_rate
FROM advisory_requests ar
FULL JOIN advisory_dates ad ON ar.id = ad.advisory_request_id
FULL JOIN advisory_attendances aa ON ad.id = aa.advisory_date_id
WHERE ar.created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

## 🛠️ Scripts de Migración

### Script 1: Crear nuevas entidades
```sql
-- Ejecutar en orden: advisory_requests, notification_preferences, 
-- notification_logs, email_templates
```

### Script 2: Modificar entidades existentes
```sql
-- Agregar columnas manteniendo compatibilidad
-- Poblar datos por defecto donde sea necesario
```

### Script 3: Poblar datos iniciales
```sql
-- Crear preferencias por defecto para usuarios existentes
INSERT INTO notification_preferences (user_id)
SELECT id FROM users WHERE id NOT IN (
  SELECT user_id FROM notification_preferences
);

-- Crear plantillas de email por defecto
-- (Ya incluidas en CREATE TABLE email_templates)
```

---

## 🔍 Validaciones y Constraints Importantes

### 1. Reglas de Negocio
```sql
-- Un estudiante no puede tener múltiples solicitudes PENDING para la misma materia
CREATE UNIQUE INDEX idx_unique_pending_request 
ON advisory_requests(student_id, subject_detail_id) 
WHERE status = 'PENDING';

-- Las asesorías no pueden tener más asistentes que el máximo configurado
-- (Validación a nivel aplicación)

-- Un profesor solo puede responder solicitudes de sus materias asignadas
-- (Validación a nivel aplicación)
```

### 2. Integridad Referencial
```sql
-- Cuando se elimina un usuario, mantener logs pero anonymizar
ALTER TABLE notification_logs 
ADD CONSTRAINT fk_notification_logs_recipient 
FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL;

-- Cuando se elimina una solicitud, mantener la sesión generada
ALTER TABLE advisory_dates 
ADD CONSTRAINT fk_advisory_dates_request 
FOREIGN KEY (advisory_request_id) REFERENCES advisory_requests(id) ON DELETE SET NULL;
```

---

## ⚠️ Consideraciones para la Migración

### 1. Datos Existentes
- **Advisory existentes**: Asignar status 'COMPLETED' por defecto
- **Usuarios existentes**: Crear preferencias con valores por defecto
- **AdvisorySchedules**: Marcar como activos y asignar capacidad por defecto

### 2. Compatibilidad
- Mantener nombres de tabla actuales hasta completar migración
- Crear aliases/views para transición gradual
- Tests exhaustivos antes de deployment

### 3. Performance
- Índices optimizados para consultas más frecuentes
- Particionamiento para tablas de logs si crecen mucho
- Caché para consultas de reportes pesadas

---

## 🎯 Checklist de Implementación

### Base de Datos
- [ ] Crear nuevas entidades en orden correcto
- [ ] Agregar columnas a entidades existentes
- [ ] Crear índices para performance
- [ ] Poblar datos por defecto
- [ ] Validar constraints y foreign keys

### Aplicación
- [ ] Actualizar entities de TypeORM
- [ ] Crear nuevos DTOs para AdvisoryRequest
- [ ] Actualizar servicios existentes
- [ ] Implementar lógica de notificaciones
- [ ] Crear endpoints para nuevas funcionalidades

### Testing
- [ ] Unit tests para nueva lógica de negocio
- [ ] Integration tests para flujos completos
- [ ] Tests de performance para queries complejas
- [ ] Tests de migración con datos reales

Esta estructura de base de datos soporta completamente todas las historias de usuario definidas y proporciona la flexibilidad necesaria para futuras extensiones del sistema.