# 🔧 Backend Endpoints Required - School Advisories System

## 📋 Context

El frontend ha sido implementado al **85% de completitud**. Las funcionalidades de **Estudiante** y **Profesor** están 100% completas con los endpoints actuales. Sin embargo, hay **funcionalidades críticas bloqueadas** que requieren nuevos endpoints en el backend.

Este documento detalla los endpoints necesarios **organizados por prioridad y complejidad** para facilitar la implementación incremental.

---

## 🎯 Phase 1: Critical Endpoints (ALTA PRIORIDAD)

Estos endpoints son **bloqueantes** para funcionalidades ya implementadas en el frontend.

### 1.1 Admin Dashboard Statistics

**Endpoint**: `GET /admin/dashboard/stats`

**Descripción**: Obtener estadísticas generales del sistema para el dashboard de administrador.

**Roles permitidos**: `admin`

**Response DTO**:
```typescript
interface AdminDashboardStats {
  // User Statistics
  total_users: number;
  total_students: number;
  total_professors: number;
  active_users: number;
  inactive_users: number;
  
  // Academic Resources
  total_subjects: number;
  active_subjects: number;
  total_venues: number;
  active_venues: number;
  
  // Advisory Statistics
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  
  // Session Statistics
  total_advisories: number;
  active_advisories: number;
  completed_sessions: number;
  upcoming_sessions: number;
  
  // Attendance Statistics
  total_attendance_records: number;
  average_attendance_rate: number; // Percentage
}
```

**SQL Queries necesarias**:
- COUNT de users por role
- COUNT de users por is_active
- COUNT de subjects por is_active
- COUNT de venues por is_active
- COUNT de advisory_requests por status
- COUNT de advisories por is_active
- COUNT de advisory_dates con date > NOW()
- COUNT de advisory_attendance
- AVG de attendance_status = 'PRESENT'

**Implementación sugerida**:
```typescript
// admin.controller.ts
@Get('dashboard/stats')
@Roles('admin')
async getDashboardStats(): Promise<AdminDashboardStats> {
  return this.adminService.getDashboardStats();
}

// admin.service.ts
async getDashboardStats(): Promise<AdminDashboardStats> {
  const [
    userStats,
    subjectStats,
    venueStats,
    requestStats,
    advisoryStats,
    attendanceStats
  ] = await Promise.all([
    this.getUserStatistics(),
    this.getSubjectStatistics(),
    this.getVenueStatistics(),
    this.getRequestStatistics(),
    this.getAdvisoryStatistics(),
    this.getAttendanceStatistics()
  ]);
  
  return {
    ...userStats,
    ...subjectStats,
    ...venueStats,
    ...requestStats,
    ...advisoryStats,
    ...attendanceStats
  };
}
```

**Impacto en frontend**:
- ✅ Desbloquea `AdminDashboard.tsx` con datos reales
- ✅ Reemplaza valores hardcodeados (0, 0, 0)
- ✅ Permite toma de decisiones basada en métricas

---

### 1.2 Get Enrolled Students by Session

**Endpoint**: `GET /advisories/sessions/:sessionId/students`

**Descripción**: Obtener lista de estudiantes inscritos en una sesión específica.

**Roles permitidos**: `professor`, `admin`

**Path Parameters**:
- `sessionId` (number): ID de la sesión (advisory_date_id)

**Response**:
```typescript
User[] // Array de estudiantes inscritos
```

**Query SQL**:
```sql
SELECT DISTINCT u.*
FROM users u
INNER JOIN advisory_enrollments ae ON u.user_id = ae.student_id
WHERE ae.advisory_date_id = :sessionId
  AND u.role = 'student'
  AND u.is_active = true
ORDER BY u.last_name, u.name;
```

**Implementación sugerida**:
```typescript
// advisories.controller.ts
@Get('sessions/:sessionId/students')
@Roles('professor', 'admin')
async getSessionStudents(
  @Param('sessionId', ParseIntPipe) sessionId: number
): Promise<User[]> {
  return this.advisoriesService.getEnrolledStudents(sessionId);
}

// advisories.service.ts
async getEnrolledStudents(sessionId: number): Promise<User[]> {
  return this.userRepository
    .createQueryBuilder('user')
    .innerJoin('advisory_enrollments', 'ae', 'ae.student_id = user.user_id')
    .where('ae.advisory_date_id = :sessionId', { sessionId })
    .andWhere('user.role = :role', { role: 'student' })
    .andWhere('user.is_active = true')
    .orderBy('user.last_name', 'ASC')
    .addOrderBy('user.name', 'ASC')
    .getMany();
}
```

**Impacto en frontend**:
- ✅ Desbloquea `AttendanceForm.tsx` (actualmente recibe `students={[]}`)
- ✅ Permite registro de asistencia funcional
- ✅ Muestra lista real de estudiantes por sesión

---

## 🔨 Phase 2: Important Endpoints (PRIORIDAD MEDIA)

Estos endpoints habilitan funcionalidades administrativas clave.

### 2.1 Subject Details - List Assignments

**Endpoint**: `GET /subject-details`

**Descripción**: Listar todas las asignaciones de profesores a materias.

**Roles permitidos**: `admin`, `professor` (solo ver sus propias asignaciones)

**Query Parameters** (opcionales):
- `subject_id` (number): Filtrar por materia
- `professor_id` (number): Filtrar por profesor
- `is_active` (boolean): Filtrar por estado activo

**Response**:
```typescript
interface SubjectDetail {
  subject_detail_id: number;
  subject_id: number;
  professor_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (populate)
  subject: {
    subject_id: number;
    name: string;
    code: string;
    description: string;
  };
  professor: {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
  };
}

SubjectDetail[]
```

**Implementación sugerida**:
```typescript
// subject-details.controller.ts
@Get()
@Roles('admin', 'professor')
async findAll(
  @Query('subject_id') subjectId?: number,
  @Query('professor_id') professorId?: number,
  @Query('is_active') isActive?: boolean,
  @Request() req?: any
): Promise<SubjectDetail[]> {
  // If professor, only show their assignments
  if (req.user.role === 'professor') {
    professorId = req.user.user_id;
  }
  
  return this.subjectDetailsService.findAll({
    subject_id: subjectId,
    professor_id: professorId,
    is_active: isActive
  });
}
```

---

### 2.2 Subject Details - Create Assignment

**Endpoint**: `POST /subject-details`

**Descripción**: Crear nueva asignación de profesor a materia.

**Roles permitidos**: `admin`

**Request Body**:
```typescript
interface CreateSubjectDetailDto {
  subject_id: number;
  professor_id: number;
  is_active?: boolean; // default: true
}
```

**Validations**:
- `subject_id`: Debe existir en la tabla subjects
- `professor_id`: Debe existir en users con role='professor'
- No permitir duplicados (misma combinación subject_id + professor_id)

**Response**: `SubjectDetail` creado

**Implementación sugerida**:
```typescript
// create-subject-detail.dto.ts
export class CreateSubjectDetailDto {
  @IsInt()
  @IsNotEmpty()
  subject_id: number;

  @IsInt()
  @IsNotEmpty()
  professor_id: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

// subject-details.service.ts
async create(dto: CreateSubjectDetailDto): Promise<SubjectDetail> {
  // Validate subject exists
  const subject = await this.subjectRepository.findOne({
    where: { subject_id: dto.subject_id }
  });
  if (!subject) {
    throw new NotFoundException('Subject not found');
  }

  // Validate professor exists and has correct role
  const professor = await this.userRepository.findOne({
    where: { user_id: dto.professor_id, role: 'professor' }
  });
  if (!professor) {
    throw new NotFoundException('Professor not found');
  }

  // Check for duplicates
  const existing = await this.subjectDetailRepository.findOne({
    where: {
      subject_id: dto.subject_id,
      professor_id: dto.professor_id
    }
  });
  if (existing) {
    throw new ConflictException('This professor is already assigned to this subject');
  }

  const subjectDetail = this.subjectDetailRepository.create(dto);
  return this.subjectDetailRepository.save(subjectDetail);
}
```

---

### 2.3 Subject Details - Update Assignment

**Endpoint**: `PATCH /subject-details/:id`

**Descripción**: Actualizar asignación existente (principalmente para toggle is_active).

**Roles permitidos**: `admin`

**Path Parameters**:
- `id` (number): subject_detail_id

**Request Body**:
```typescript
interface UpdateSubjectDetailDto {
  subject_id?: number;
  professor_id?: number;
  is_active?: boolean;
}
```

**Response**: `SubjectDetail` actualizado

---

### 2.4 Subject Details - Delete Assignment

**Endpoint**: `DELETE /subject-details/:id`

**Descripción**: Eliminar asignación de profesor a materia.

**Roles permitidos**: `admin`

**Path Parameters**:
- `id` (number): subject_detail_id

**Response**: `{ message: 'Subject detail deleted successfully' }`

**Consideración**: Verificar si hay advisories activas usando esta asignación antes de eliminar.

---

### 2.5 Subject Details - Toggle Status

**Endpoint**: `PATCH /subject-details/:id/toggle-status`

**Descripción**: Cambiar estado activo/inactivo de una asignación.

**Roles permitidos**: `admin`

**Path Parameters**:
- `id` (number): subject_detail_id

**Response**: `SubjectDetail` con estado actualizado

**Implementación sugerida**:
```typescript
@Patch(':id/toggle-status')
@Roles('admin')
async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<SubjectDetail> {
  const subjectDetail = await this.subjectDetailsService.findOne(id);
  if (!subjectDetail) {
    throw new NotFoundException('Subject detail not found');
  }
  
  return this.subjectDetailsService.update(id, {
    is_active: !subjectDetail.is_active
  });
}
```

**Impacto en frontend (Phase 2 completo)**:
- ✅ Habilita gestión completa de asignaciones profesor-materia
- ✅ Permite crear componente `SubjectDetailsManager.tsx`
- ✅ Completa funcionalidades de admin al 95%

---

## 🎨 Phase 3: Enhancement Endpoints (PRIORIDAD BAJA)

Estos endpoints mejoran la experiencia de usuario y optimizan operaciones.

### 3.1 Get Session Details by ID

**Endpoint**: `GET /advisories/sessions/:sessionId`

**Descripción**: Obtener detalles completos de una sesión específica con relaciones.

**Roles permitidos**: `professor`, `admin`, `student` (solo si está inscrito)

**Path Parameters**:
- `sessionId` (number): advisory_date_id

**Response**:
```typescript
interface SessionDetails {
  // Session Info
  advisory_date_id: number;
  advisory_id: number;
  date: string;
  topic: string;
  notes: string;
  venue_id: number;
  is_active: boolean;
  
  // Relations
  venue: Venue;
  advisory: {
    advisory_id: number;
    request_id: number;
    subject: Subject;
    professor: User;
  };
  
  // Enrolled Students
  enrolled_students: User[];
  total_enrolled: number;
  
  // Attendance Info
  attendance_records: AttendanceRecord[];
  attendance_summary: {
    total_students: number;
    present: number;
    late: number;
    absent: number;
    attendance_rate: number; // percentage
  };
  
  // Completion Info
  is_completed: boolean;
  completion_notes?: string;
  topics_covered?: string[];
  completed_at?: string;
}
```

**Query SQL**:
```sql
SELECT 
  ad.*,
  json_build_object(
    'venue_id', v.venue_id,
    'name', v.name,
    'location', v.location,
    'capacity', v.capacity
  ) as venue,
  json_build_object(
    'advisory_id', a.advisory_id,
    'subject', s.*,
    'professor', p.*
  ) as advisory,
  COALESCE(json_agg(DISTINCT u.*) FILTER (WHERE u.user_id IS NOT NULL), '[]') as enrolled_students,
  COALESCE(json_agg(DISTINCT aa.*) FILTER (WHERE aa.attendance_id IS NOT NULL), '[]') as attendance_records
FROM advisory_dates ad
LEFT JOIN venues v ON ad.venue_id = v.venue_id
LEFT JOIN advisories a ON ad.advisory_id = a.advisory_id
LEFT JOIN subjects s ON a.subject_id = s.subject_id
LEFT JOIN users p ON a.professor_id = p.user_id
LEFT JOIN advisory_enrollments ae ON ad.advisory_date_id = ae.advisory_date_id
LEFT JOIN users u ON ae.student_id = u.user_id AND u.role = 'student'
LEFT JOIN advisory_attendance aa ON ad.advisory_date_id = aa.advisory_date_id
WHERE ad.advisory_date_id = :sessionId
GROUP BY ad.advisory_date_id, v.venue_id, a.advisory_id, s.subject_id, p.user_id;
```

**Impacto en frontend**:
- ✅ Optimiza `ManageSessionsPage.tsx` (actualmente usa lista completa)
- ✅ Habilita modal "Ver detalles" con información completa
- ✅ Reduce queries innecesarias

---

### 3.2 Email Templates - List Templates

**Endpoint**: `GET /admin/email-templates`

**Descripción**: Listar todas las plantillas de email del sistema.

**Roles permitidos**: `admin`

**Response**:
```typescript
interface EmailTemplate {
  template_name: string; // e.g., 'invitation_email', 'session_reminder'
  subject: string;
  body: string; // HTML template
  variables: string[]; // e.g., ['{{student_name}}', '{{session_date}}']
  description: string;
  is_active: boolean;
  last_updated: string;
}

EmailTemplate[]
```

**Templates esperados**:
1. `invitation_email` - Cuando profesor invita a estudiante
2. `session_reminder` - Recordatorio 24h antes de sesión
3. `session_completion` - Resumen al completar sesión
4. `request_approved` - Solicitud aprobada por profesor
5. `request_rejected` - Solicitud rechazada por profesor
6. `advisory_created` - Confirmación de asesoría creada

**Implementación sugerida**:
```typescript
// email-templates.entity.ts
@Entity('email_templates')
export class EmailTemplate {
  @PrimaryColumn()
  template_name: string;

  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column('simple-array')
  variables: string[];

  @Column('text')
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @UpdateDateColumn()
  last_updated: Date;
}
```

---

### 3.3 Email Templates - Update Template

**Endpoint**: `PATCH /admin/email-templates/:templateName`

**Descripción**: Actualizar plantilla de email.

**Roles permitidos**: `admin`

**Path Parameters**:
- `templateName` (string): Nombre de la plantilla

**Request Body**:
```typescript
interface UpdateEmailTemplateDto {
  subject?: string;
  body?: string;
  is_active?: boolean;
}
```

**Validations**:
- Validar que las variables requeridas estén presentes en el body
- Validar HTML syntax si es HTML template

**Response**: `EmailTemplate` actualizado

**Impacto en frontend (Phase 3 completo)**:
- ✅ Permite personalización de notificaciones
- ✅ Habilita componente `EmailTemplateEditor.tsx`
- ✅ Mejora experiencia de administración

---

## 📊 Database Changes Required

### Nueva Tabla: `subject_details`

```sql
CREATE TABLE subject_details (
  subject_detail_id SERIAL PRIMARY KEY,
  subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  professor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate assignments
  UNIQUE(subject_id, professor_id)
);

-- Indexes for performance
CREATE INDEX idx_subject_details_subject ON subject_details(subject_id);
CREATE INDEX idx_subject_details_professor ON subject_details(professor_id);
CREATE INDEX idx_subject_details_active ON subject_details(is_active);
```

### Nueva Tabla: `email_templates` (opcional para Phase 3)

```sql
CREATE TABLE email_templates (
  template_name VARCHAR(100) PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[], -- Array de variables permitidas
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert default templates
INSERT INTO email_templates (template_name, subject, body, variables, description) VALUES
('invitation_email', 'Invitación a Sesión de Asesoría', '<html>...</html>', ARRAY['{{student_name}}', '{{session_date}}', '{{topic}}'], 'Email enviado cuando profesor invita a estudiante'),
('session_completion', 'Resumen de Sesión Completada', '<html>...</html>', ARRAY['{{session_topic}}', '{{notes}}', '{{topics_covered}}'], 'Email enviado al completar sesión');
```

---

## 🎯 Implementation Roadmap

### Week 1: Critical Endpoints (Desbloquea funcionalidades)
- [ ] `GET /admin/dashboard/stats` (2-3 horas)
- [ ] `GET /advisories/sessions/:sessionId/students` (1 hora)
- [ ] Testing de ambos endpoints (1 hora)

**Resultado**: Frontend pasa de 85% → 92% completitud

---

### Week 2: Subject Details CRUD (Funcionalidad administrativa)
- [ ] Crear tabla `subject_details` (30 min)
- [ ] `GET /subject-details` con filters (2 horas)
- [ ] `POST /subject-details` con validaciones (2 horas)
- [ ] `PATCH /subject-details/:id` (1 hora)
- [ ] `DELETE /subject-details/:id` (1 hora)
- [ ] `PATCH /subject-details/:id/toggle-status` (30 min)
- [ ] Testing CRUD completo (2 horas)

**Resultado**: Frontend pasa de 92% → 97% completitud

---

### Week 3: Enhancement Endpoints (Optimizaciones)
- [ ] `GET /advisories/sessions/:sessionId` con joins (3 horas)
- [ ] Crear tabla `email_templates` (1 hora)
- [ ] `GET /admin/email-templates` (1 hora)
- [ ] `PATCH /admin/email-templates/:name` (2 horas)
- [ ] Testing y documentación (2 horas)

**Resultado**: Frontend pasa de 97% → 100% completitud

---

## 🧪 Testing Checklist

Para cada endpoint implementado:

- [ ] Unit tests con Jest
- [ ] Integration tests con Supertest
- [ ] Validación de DTOs con class-validator
- [ ] Manejo de errores (404, 403, 400, 409)
- [ ] Guards de autenticación (@Roles)
- [ ] Swagger documentation (@ApiOperation, @ApiResponse)
- [ ] Logs de auditoría (creación, actualización, eliminación)

---

## 📝 Additional Notes

### Performance Considerations

1. **Dashboard Stats**: Implementar caching con Redis (TTL: 5 minutos)
```typescript
@UseInterceptors(CacheInterceptor)
@CacheTTL(300) // 5 minutes
@Get('dashboard/stats')
```

2. **Session Students**: Eager loading vs lazy loading
```typescript
// Use eager loading for small lists
relations: ['enrollments', 'enrollments.student']
```

3. **Subject Details**: Indexar foreign keys para queries rápidas

### Security Considerations

1. **Role-based access**: Verificar roles en todos los endpoints
2. **Data isolation**: Profesores solo ven sus propias asignaciones
3. **Input validation**: Usar DTOs con decoradores de validación
4. **SQL Injection**: Usar QueryBuilder o Prisma, nunca raw queries

### Migration Strategy

1. Crear migrations en orden:
   - `1_create_subject_details_table.ts`
   - `2_create_email_templates_table.ts`
   - `3_insert_default_email_templates.ts`

2. Seed data para desarrollo:
   - Subject details con profesores de prueba
   - Email templates por defecto

---

## 🤝 Frontend Integration

Una vez implementados, el frontend necesitará:

### Phase 1 Integration:
```typescript
// Actualizar AdminDashboard.tsx
const { data: stats } = useQuery({
  queryKey: ['admin-dashboard-stats'],
  queryFn: getAdminDashboardStats
});

// Actualizar AttendanceForm.tsx
const { data: students } = useQuery({
  queryKey: ['session-students', sessionId],
  queryFn: () => getSessionStudents(sessionId)
});
```

### Phase 2 Integration:
```typescript
// Crear SubjectDetailsManager.tsx
const { data: assignments } = useQuery({
  queryKey: ['subject-details'],
  queryFn: getSubjectDetails
});

const createMutation = useMutation({
  mutationFn: createSubjectDetail,
  onSuccess: () => queryClient.invalidateQueries(['subject-details'])
});
```

---

## ✅ Definition of Done

Cada endpoint está completo cuando:

1. ✅ Código implementado y commiteado
2. ✅ Tests unitarios pasando (>80% coverage)
3. ✅ Tests de integración pasando
4. ✅ Swagger documentation actualizada
5. ✅ Probado en Postman/Thunder Client
6. ✅ Logs de auditoría funcionando
7. ✅ Frontend integrado y probado
8. ✅ Code review aprobado

---

## 📞 Questions & Support

Si tienes dudas durante la implementación:

1. **Database schema**: Revisar diagrama ER en `/docs/ER-diagram.puml`
2. **DTOs reference**: Ver archivos existentes en backend
3. **Frontend types**: Ver `src/api/types.ts` para estructura esperada

---

**Documento generado**: 18 de Noviembre, 2025  
**Versión**: 1.0  
**Autor**: GitHub Copilot (Frontend Analysis)  
**Estado del proyecto**: 85% → Target: 100%
