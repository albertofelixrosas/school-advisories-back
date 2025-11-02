# 🚀 Roadmap de Migración del Proyecto

## 📋 Resumen
Este documento contiene el plan paso a paso para migrar el proyecto actual hacia la nueva arquitectura definida en las historias de usuario. Marca cada item como completado (`[x]`) cuando termines.

---

## 📊 Estado Actual vs Objetivo

### ✅ Lo que ya tenemos:
- Autenticación JWT con roles (ADMIN, PROFESSOR, STUDENT)
- Entidades básicas: User, Advisory, AdvisoryDate, AdvisorySchedule, Subject, Venue
- CRUD básico para la mayoría de entidades
- Swagger configurado
- Validación global con ValidationPipe

### ❌ Lo que necesitamos agregar/modificar:
- Sistema de solicitudes (AdvisoryRequest)
- Estados de asesorías (PENDING, APPROVED, COMPLETED, etc.)
- Notificaciones por email
- Reportes y estadísticas
- Campos de auditoría (created_by, updated_at, etc.)
- Mejores validaciones de negocio

---

## 🎯 **FASE 1: Preparación y Base** (Estimado: 2-3 días)

### 1.1 Configuración Inicial
- [x] **1.1.1** Instalar dependencias adicionales necesarias ✅
  ```bash
  npm install @nestjs/schedule @nestjs/bull bull redis
  npm install nodemailer @types/nodemailer moment date-fns
  ```

- [x] **1.1.2** Configurar variables de entorno para email ✅
  ```env
  # Agregado a .env.development
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=tu-email@gmail.com
  SMTP_PASS=tu-app-password
  FROM_EMAIL=noreply@universidad.edu.mx
  FROM_NAME=Sistema de Asesorías
  REDIS_HOST=localhost
  REDIS_PORT=6379
  ```

- [x] **1.1.3** Actualizar `env.validation.ts` con nuevas variables ✅
- [x] **1.1.4** Configurar módulo de Bull Queue para emails asíncronos ✅

### 1.2 Actualización de Base de Datos
- [x] **1.2.1** Crear migración para nuevos campos en entidades existentes ✅
  - Agregar `status`, `created_by_id`, `cancelled_by_id`, `created_at`, `updated_at` a `Advisory`
  - Agregar `notes`, `session_link`, `completed_at`, `created_at`, `updated_at` a `AdvisoryDate`
  - Agregar `max_students_per_slot`, `is_active` a `AdvisorySchedule`
  - Agregar `last_login_at`, `is_active`, `created_at`, `updated_at` a `User`

- [x] **1.2.2** Crear entidad `AdvisoryRequest` ✅
- [x] **1.2.3** Crear entidad `NotificationPreferences` ✅
- [x] **1.2.4** Crear entidad `NotificationLogs` ✅
- [x] **1.2.5** Crear entidad `EmailTemplates` ✅
- [x] **1.2.6** Ejecutar migraciones y verificar integridad ✅

---

## 🎯 **FASE 2: Epic 1 - Sistema de Solicitudes** (Estimado: 4-5 días)

### 2.1 Backend - Entidades y DTOs
- [x] **2.1.1** Crear `AdvisoryRequestEntity` con todas las relaciones ✅
- [x] **2.1.2** Crear DTOs para AdvisoryRequest: ✅
  - `CreateAdvisoryRequestDto` ✅
  - `UpdateAdvisoryRequestDto` ✅
  - `AdvisoryRequestResponseDto` ✅
  - `ApproveRequestDto` ✅
  - `RejectRequestDto` ✅
- [x] **2.1.3** Actualizar DTOs existentes de Advisory y AdvisoryDate ✅
- [x] **2.1.4** Crear enums para estados: `RequestStatus`, `AdvisoryStatus` ✅

### 2.2 Backend - Servicios y Lógica de Negocio
- [x] **2.2.1** Crear `AdvisoryRequestService` con métodos: ✅
  - `createRequest(studentId, createDto)` ✅
  - `findPendingByProfessor(professorId)` ✅
  - `findMyRequests(studentId)` ✅
  - `approveRequest(requestId, approvalDto)` ✅
  - `rejectRequest(requestId, rejectionDto)` ✅
  - `cancelRequest(requestId, userId)` ✅

- [x] **2.2.2** Actualizar `AdvisoryService` para integrar con solicitudes ✅
- [x] **2.2.3** Implementar validaciones de negocio: ✅
  - Estudiante solo puede solicitar materias que existen ✅
  - No solicitudes duplicadas PENDING para misma materia ✅
  - Solo profesor asignado puede aprobar/rechazar ✅
  - Verificación de roles y permisos ✅

- [x] **2.2.4** Crear guards y decorators: ✅
  - Usar `@Roles()` decorator existente ✅
  - Integración con `JwtAuthGuard` y `RolesGuard` ✅

### 2.3 Backend - Controladores y Endpoints
- [x] **2.3.1** Crear `AdvisoryRequestController` con endpoints: ✅
  ```typescript
  POST   /advisory-requests                    // Crear solicitud ✅
  GET    /advisory-requests/my-requests        // Mis solicitudes (estudiante) ✅
  GET    /advisory-requests/pending            // Pendientes (profesor) ✅
  PATCH  /advisory-requests/:id/approve        // Aprobar ✅
  PATCH  /advisory-requests/:id/reject         // Rechazar ✅
  DELETE /advisory-requests/:id/cancel         // Cancelar ✅
  ```

- [x] **2.3.2** Actualizar `AdvisoryController` para manejar estados ✅
- [x] **2.3.3** Agregar endpoints de cancelación a controladores existentes ✅

### 2.4 Testing
- [ ] **2.4.1** Unit tests para `AdvisoryRequestService`
- [ ] **2.4.2** Integration tests para endpoints críticos
- [ ] **2.4.3** E2E tests para flujo completo: solicitud → aprobación → sesión

---

## 🎯 **FASE 3: Epic 6 - Sistema de Notificaciones** (Estimado: 3-4 días)

### 3.1 Infraestructura de Email
- [ ] **3.1.1** Crear `EmailService` con métodos básicos:
  - `sendEmail(to, subject, html)`
  - `sendTemplate(templateKey, to, variables)`

- [ ] **3.1.2** Crear `EmailTemplateService`:
  - `getTemplate(key)`
  - `renderTemplate(template, variables)`
  - `createTemplate(templateDto)`

- [ ] **3.1.3** Configurar Bull Queue para emails:
  - `email-queue` processor
  - Jobs para envío asíncrono
  - Retry logic para fallos

### 3.2 Sistema de Plantillas
- [ ] **3.2.1** Crear plantillas por defecto en la BD:
  - `advisory_request_new`
  - `advisory_request_approved`
  - `advisory_request_rejected`
  - `advisory_cancelled`
  - `advisory_reminder`

- [ ] **3.2.2** Crear `EmailTemplateController` para admin:
  ```typescript
  GET    /admin/email-templates               // Listar plantillas
  PUT    /admin/email-templates/:key          // Actualizar plantilla
  POST   /admin/email-templates/:key/preview  // Preview con datos ejemplo
  ```

### 3.3 Notificaciones Automáticas
- [ ] **3.3.1** Crear `NotificationService` que escuche eventos:
  - `onRequestCreated()`
  - `onRequestApproved()`
  - `onRequestRejected()`
  - `onAdvisoryCancelled()`

- [ ] **3.3.2** Integrar notificaciones en servicios existentes:
  - `AdvisoryRequestService` → envía emails en approve/reject
  - `AdvisoryService` → envía emails en cancelación

- [ ] **3.3.3** Crear sistema de recordatorios con Cron:
  ```typescript
  @Cron('0 10 * * *') // Diario a las 10 AM
  async sendDailyReminders()
  ```

### 3.4 Preferencias de Usuario
- [ ] **3.4.1** Crear `NotificationPreferencesService`
- [ ] **3.4.2** Endpoints en `UsersController`:
  ```typescript
  GET /users/me/notification-preferences
  PUT /users/me/notification-preferences
  ```
- [ ] **3.4.3** Lógica para respetar preferencias antes de enviar

---

## 🎯 **FASE 4: Epic 2 - Creación Directa y Asistencia** (Estimado: 2-3 días)

### 4.1 Mejorar Gestión de Sesiones
- [ ] **4.1.1** Actualizar `AdvisoryService` para crear sesiones directas:
  - `createDirectSession(professorId, sessionDto)`
  - `inviteStudents(sessionId, studentIds)`

- [ ] **4.1.2** Mejorar `AdvisoryDateService`:
  - `markAttendance(sessionId, attendanceData)`
  - `completeSession(sessionId, notes)`
  - `getSessionAttendance(sessionId)`

- [ ] **4.1.3** Validaciones adicionales:
  - Verificar cupo máximo
  - Solo profesor asignado puede crear sesiones
  - Validar solapamiento de horarios

### 4.2 Registro de Asistencia Mejorado
- [ ] **4.2.1** Actualizar `AdvisoryAttendanceService`:
  - Marcar múltiples estudiantes a la vez
  - Agregar notas por estudiante
  - Histórico de cambios en asistencia

- [ ] **4.2.2** Endpoints mejorados:
  ```typescript
  POST /advisory-sessions/:id/attendance     // Marcar asistencia masiva
  PATCH /advisory-sessions/:id/complete      // Completar sesión
  GET /advisory-sessions/:id/attendance      // Ver asistencia actual
  ```

---

## 🎯 **FASE 5: Epic 3 - Disponibilidad y Horarios** (Estimado: 2-3 días)

### 5.1 Refactoring de AdvisorySchedule
- [ ] **5.1.1** Renombrar conceptualmente a `ProfessorAvailability`
- [ ] **5.1.2** Agregar campos faltantes:
  - `max_students_per_slot`
  - `is_active`
  - `venue_preference`

- [ ] **5.1.3** Crear `AvailabilityService`:
  - `setRecurringAvailability(professorId, slots)`
  - `getAvailableSlots(professorId, subjectId)`
  - `toggleAvailability(slotId, isActive)`

### 5.2 Integración con Solicitudes
- [ ] **5.2.1** Modificar creación de solicitudes para usar disponibilidad
- [ ] **5.2.2** Endpoint para estudiantes:
  ```typescript
  GET /professors/:id/availability/:subjectId  // Ver horarios disponibles
  ```

---

## 🎯 **FASE 6: Epic 4 - Materias y Asignaciones** (Estimado: 2 días)

### 6.1 Mejorar Gestión de Materias
- [ ] **6.1.1** Agregar validaciones a `SubjectsService`:
  - Unicidad de nombres
  - No eliminar si tiene asignaciones activas

- [ ] **6.1.2** Mejorar `SubjectDetailsService` (asignaciones):
  - `assignProfessorToSubject(professorId, subjectId)`
  - `removeAssignment(assignmentId)`
  - `getProfessorSubjects(professorId)`

### 6.2 Validaciones de Permisos
- [ ] **6.2.1** Crear `SubjectAssignmentGuard`
- [ ] **6.2.2** Aplicar guard en endpoints críticos:
  - Creación de asesorías
  - Aprobación de solicitudes

---

## 🎯 **FASE 7: Epic 5 - Reportes y Estadísticas** (Estimado: 3-4 días)

### 7.1 Servicios de Reportes
- [ ] **7.1.1** Crear `ReportsService` con métodos:
  - `getDashboardMetrics(period)`
  - `getProfessorReport(professorId, filters)`
  - `getSubjectReport(subjectId, filters)`
  - `getAttendanceReport(filters)`

- [ ] **7.1.2** Crear queries optimizadas para reportes grandes
- [ ] **7.1.3** Implementar caché para reportes frecuentes

### 7.2 Controladores y Endpoints
- [ ] **7.2.1** Crear `ReportsController`:
  ```typescript
  GET /reports/dashboard                 // Métricas principales
  GET /reports/professors/:id           // Reporte profesor
  GET /reports/subjects/:id             // Reporte materia
  GET /reports/attendance               // Reporte asistencia
  ```

### 7.3 Exportación
- [ ] **7.3.1** Integrar librería para Excel (exceljs)
- [ ] **7.3.2** Integrar librería para PDF (puppeteer)
- [ ] **7.3.3** Endpoints de exportación:
  ```typescript
  GET /reports/:reportId/export?format=xlsx
  GET /reports/:reportId/export?format=pdf
  ```

---

## 🎯 **FASE 8: Testing y Optimización** (Estimado: 2-3 días)

### 8.1 Testing Comprehensivo
- [ ] **8.1.1** Unit tests para todos los servicios nuevos
- [ ] **8.1.2** Integration tests para endpoints críticos
- [ ] **8.1.3** E2E tests para flujos completos:
  - Solicitud → Aprobación → Asistencia → Reporte
  - Notificaciones automáticas
  - Exportación de reportes

### 8.2 Performance y Optimización
- [ ] **8.2.1** Optimizar queries de reportes
- [ ] **8.2.2** Implementar índices de BD necesarios
- [ ] **8.2.3** Configurar caché para consultas frecuentes
- [ ] **8.2.4** Optimizar envío de emails (batch processing)

### 8.3 Documentación
- [ ] **8.3.1** Actualizar documentación de Swagger
- [ ] **8.3.2** Crear guía de migración para datos existentes
- [ ] **8.3.3** Documentar nuevos endpoints en README

---

## 🎯 **FASE 9: Deployment y Monitoreo** (Estimado: 1-2 días)

### 9.1 Preparación para Producción
- [ ] **9.1.1** Configurar variables de entorno de producción
- [ ] **9.1.2** Scripts de migración de datos existentes
- [ ] **9.1.3** Configurar logs estructurados
- [ ] **9.1.4** Configurar health checks

### 9.2 Monitoreo
- [ ] **9.2.1** Métricas de uso de APIs
- [ ] **9.2.2** Monitoreo de cola de emails
- [ ] **9.2.3** Alertas para fallos críticos

---

## 📊 **Checklist de Completitud por Epic**

### Epic 1: Solicitudes ✅❌
- [ ] Estudiante puede crear solicitud
- [ ] Profesor recibe notificación de solicitud
- [ ] Profesor puede aprobar/rechazar
- [ ] Se crea sesión automáticamente al aprobar
- [ ] Estudiante recibe confirmación/rechazo
- [ ] Cualquiera puede cancelar con notificación

### Epic 2: Creación Directa ✅❌
- [ ] Profesor puede crear sesión sin solicitud previa
- [ ] Puede invitar estudiantes específicos
- [ ] Registro de asistencia funcional
- [ ] Sesión se marca como completada
- [ ] Notas de sesión guardadas

### Epic 3: Disponibilidad ✅❌
- [ ] Profesor define horarios recurrentes
- [ ] Estudiante ve disponibilidad al solicitar
- [ ] Cupos por slot configurables
- [ ] Disponibilidad activable/desactivable

### Epic 4: Materias ✅❌
- [ ] Admin gestiona catálogo de materias
- [ ] Admin asigna profesores a materias
- [ ] Validación de permisos en asesorías
- [ ] Vistas filtradas por rol

### Epic 5: Reportes ✅❌
- [ ] Dashboard con métricas clave
- [ ] Reportes por profesor y materia
- [ ] Exportación a Excel/PDF
- [ ] Reportes de asistencia

### Epic 6: Notificaciones ✅❌
- [ ] Email de nueva solicitud
- [ ] Email de aprobación/rechazo
- [ ] Email de cancelación
- [ ] Recordatorios automáticos
- [ ] Preferencias configurables
- [ ] Admin gestiona plantillas

---

## 🛠️ **Comandos Útiles Durante el Desarrollo**

### Crear nuevas entidades:
```bash
nest g resource advisory-requests
nest g resource notification-preferences
nest g resource email-templates
nest g resource reports
```

### Generar migraciones:
```bash
npm run typeorm:generate -- -n AddAdvisoryRequestEntity
npm run typeorm:generate -- -n UpdateExistingEntities
```

### Testing:
```bash
npm run test                    # Unit tests
npm run test:e2e               # E2E tests
npm run test:cov               # Coverage
```

### Build y deploy:
```bash
npm run build
npm run start:prod
```

---

## 📝 **Notas Importantes**

1. **Backward Compatibility**: Mantener endpoints existentes funcionando durante la migración
2. **Data Migration**: Crear scripts para migrar datos existentes al nuevo esquema
3. **Feature Flags**: Considerar feature flags para habilitar funcionalidades gradualmente
4. **Performance**: Monitorear performance con cada cambio, especialmente en reportes
5. **Security**: Revisar que nuevos endpoints tengan autenticación/autorización correcta

---

## 🎯 **Criterios de Éxito**

- [ ] Todos los tests pasan (>90% coverage)
- [ ] Documentación Swagger actualizada
- [ ] Performance aceptable (<500ms en endpoints principales)
- [ ] Emails se envían correctamente
- [ ] Reportes generan sin errores
- [ ] Sistema funciona end-to-end según historias de usuario

---

**¡Marca cada item cuando lo completes! Este roadmap te guiará paso a paso hacia el sistema completo de asesorías.**