# Epic 4: Gestión de Materias y Asignaciones

**🏆 Prioridad: MEDIA** | **Complejidad: Baja** | **Sprint: 2**

---

## 📝 **Descripción de la Épica**

Como administrador, necesito gestionar el catálogo de materias y las asignaciones de profesores a materias específicas, para controlar qué profesores pueden impartir asesorías de cuáles materias y mantener la integridad del sistema.

**Valor de Negocio**: Control administrativo completo sobre la oferta académica y asignaciones docentes.

---

## 🎯 **Historias de Usuario**

### **US-013: Admin gestiona catálogo de materias**

```gherkin
Como administrador
Quiero gestionar el catálogo completo de materias de la universidad
Para mantener actualizada la oferta académica disponible

Given soy un administrador autenticado
When navego a "Administración" → "Materias"
Then veo tabla paginada con todas las materias:
  - Código de materia
  - Nombre completo
  - Créditos
  - Estado: Activa/Inactiva
  - # Profesores asignados
  - Acciones: [Editar] [Ver Profesores] [Activar/Desactivar]

When hago clic en "Nueva Materia"
Then aparece modal con:
  - Código: [input] ej: "CALC001"
  - Nombre: [input] ej: "Cálculo Diferencial"
  - Descripción: [textarea, opcional]
  - Créditos: [number]
  - Activa: [checkbox, default: true]

When completo y guardo
Then materia se crea y aparece en la tabla
And está disponible para asignar profesores
And aparece en dropdowns de creación de asesorías (si hay profesores asignados)
```

**Criterios de Aceptación**:
- ✅ Código de materia debe ser único
- ✅ Nombre de materia debe ser único
- ✅ Solo materias activas aparecen en formularios de usuarios
- ✅ No puedo eliminar materias con asesorías registradas
- ✅ Puedo desactivar materias para ocultar sin eliminar
- ✅ Búsqueda por código o nombre en la tabla

**Endpoints**:
```http
GET /api/admin/subjects
Query params: ?page=1&search=calc&status=active
Response: {
  "subjects": [{
    "id": 1,
    "code": "CALC001", 
    "name": "Cálculo Diferencial",
    "credits": 6,
    "isActive": true,
    "assignedProfessors": 3,
    "totalSessions": 25
  }],
  "pagination": {"page": 1, "totalPages": 10}
}

POST /api/admin/subjects
Body: {
  "code": "CALC001",
  "name": "Cálculo Diferencial", 
  "description": "Materia fundamental de matemáticas",
  "credits": 6,
  "isActive": true
}

PUT /api/admin/subjects/:id
PATCH /api/admin/subjects/:id/toggle-status
```

---

### **US-014: Admin gestiona asignaciones profesor-materia**

```gherkin
Como administrador
Quiero asignar profesores a materias específicas
Para controlar quién puede impartir asesorías de cada materia

Given tengo materias creadas y profesores registrados
When navego a "Administración" → "Asignaciones"
Then veo dos vistas disponibles:
  - Vista por Profesor: lista profesores con sus materias asignadas
  - Vista por Materia: lista materias con profesores asignados

En Vista por Profesor:
When hago clic en un profesor
Then veo sus materias actuales y botón "Asignar Nueva Materia"
When selecciono "Asignar Nueva Materia"
Then aparece modal con:
  - Materia: [dropdown de materias activas no asignadas al profesor]
  - Fecha inicio: [date picker, default: hoy]
  - Fecha fin: [date picker, opcional]
  - Activa: [checkbox, default: true]

En Vista por Materia:
When hago clic en una materia
Then veo profesores asignados y botón "Asignar Profesor"
When selecciono "Asignar Profesor" 
Then aparece modal similar para asignar nuevo profesor

When confirmo asignación
Then se crea registro en SubjectDetails/TeachingAssignment
And profesor puede crear asesorías para esa materia
And estudiantes de esa materia pueden solicitar asesorías con ese profesor
```

**Criterios de Aceptación**:
- ✅ Un profesor puede enseñar múltiples materias
- ✅ Una materia puede ser impartida por múltiples profesores
- ✅ No puedo crear asignación duplicada (profesor-materia ya existente)
- ✅ Puedo desactivar asignaciones sin eliminar historial
- ✅ Fecha de fin permite asignaciones temporales
- ✅ Solo asignaciones activas permiten crear asesorías

**Endpoints**:
```http
GET /api/admin/assignments/by-professor
Response: [{
  "professor": {"id": 1, "name": "Dr. García"},
  "assignments": [{
    "id": 10,
    "subject": {"code": "CALC001", "name": "Cálculo"},
    "startDate": "2025-01-15",
    "endDate": null,
    "isActive": true,
    "sessionsCount": 12
  }]
}]

GET /api/admin/assignments/by-subject  
Response: [{
  "subject": {"id": 1, "code": "CALC001", "name": "Cálculo"},
  "assignments": [{
    "professor": {"name": "Dr. García"},
    "startDate": "2025-01-15",
    "isActive": true
  }]
}]

POST /api/admin/assignments
Body: {
  "professorId": 5,
  "subjectId": 2,
  "startDate": "2025-01-15",
  "endDate": "2025-12-15", // opcional
  "isActive": true
}

PATCH /api/admin/assignments/:id/toggle-status
DELETE /api/admin/assignments/:id // solo si no hay sesiones creadas
```

---

### **US-015: Validación de integridad académica**

```gherkin
Como sistema
Quiero validar que las asignaciones y permisos sean coherentes académicamente
Para mantener integridad de datos y evitar inconsistencias

Given un profesor intenta crear asesoría
When selecciona una materia
Then el sistema valida que tenga asignación activa para esa materia
And si no la tiene, muestra error: "No tienes permisos para impartir esta materia"

Given un estudiante intenta solicitar asesoría
When selecciona materia y profesor
Then el sistema valida que:
  - El estudiante esté matriculado en esa materia
  - El profesor tenga asignación activa para esa materia
  - La asignación esté vigente (dentro de fechas si están definidas)
And si alguna validación falla, muestra error específico

Given un admin intenta desactivar una asignación
When la asignación tiene sesiones futuras programadas
Then el sistema muestra advertencia: "Esta asignación tiene X sesiones programadas. ¿Continuar?"
And permite elegir qué hacer con las sesiones existentes:
  - Cancelar sesiones futuras
  - Transferir a otro profesor de la misma materia
  - Mantener sesiones pero no permitir nuevas
```

**Criterios de Aceptación**:
- ✅ Validaciones en tiempo real antes de permitir acciones
- ✅ Mensajes de error claros y específicos
- ✅ Advertencias para acciones que afectan datos existentes
- ✅ Opciones para manejar dependencias cuando se modifican asignaciones
- ✅ Log de auditoría de cambios de asignaciones

**Endpoints**:
```http
POST /api/admin/assignments/validate
Body: {
  "action": "CREATE_SESSION|REQUEST_ADVISORY",
  "professorId": 5,
  "subjectId": 2,
  "studentId": 100 // solo para REQUEST_ADVISORY
}
Response: {
  "isValid": true|false,
  "errors": ["Professor not assigned to this subject"],
  "warnings": ["Assignment expires in 30 days"]
}

GET /api/admin/assignments/:id/impact-analysis
Response: {
  "futureSessions": 5,
  "pendingRequests": 2,
  "affectedStudents": 15,
  "recommendedActions": ["Transfer to Dr. Smith", "Cancel sessions"]
}
```

---

### **US-016: Profesor visualiza sus asignaciones**

```gherkin
Como profesor
Quiero ver todas mis asignaciones de materias actuales y pasadas
Para conocer para qué materias puedo crear asesorías

Given soy un profesor autenticado
When navego a "Mis Materias" 
Then veo dos secciones:

Materias Activas:
  - Lista de materias que actualmente puedo impartir
  - Para cada materia: nombre, código, fecha de asignación
  - Estadísticas: # asesorías impartidas, # estudiantes atendidos
  - Botón "Crear Asesoría" para cada materia

Historial de Asignaciones:
  - Materias que impartí en el pasado (desactivadas o con fecha fin)
  - Solo lectura, con estadísticas históricas
  - Posibilidad de ver reportes históricos

When hago clic en "Crear Asesoría" de una materia activa
Then me redirige al formulario de creación con la materia preseleccionada
And solo veo estudiantes matriculados en esa materia específica
```

**Criterios de Aceptación**:
- ✅ Solo veo mis propias asignaciones
- ✅ Distinción clara entre asignaciones activas e históricas
- ✅ Estadísticas precisas por materia
- ✅ Acceso rápido a crear asesorías desde mis materias activas
- ✅ Filtrado automático de estudiantes por materia seleccionada

**Endpoints**:
```http
GET /api/professors/my-assignments
Response: {
  "active": [{
    "id": 10,
    "subject": {"code": "CALC001", "name": "Cálculo Diferencial"},
    "startDate": "2025-01-15",
    "stats": {
      "totalSessions": 25,
      "studentsHelped": 45,
      "avgAttendance": 85
    }
  }],
  "historical": [{
    "subject": {"name": "Álgebra Lineal"},
    "period": "2024-01-15 to 2024-12-15",
    "finalStats": {...}
  }]
}
```

---

## 🔧 **Cambios Técnicos Requeridos**

### **Modificaciones a Subject entity**:
```typescript
// Agregar campos de gestión
@Column({ unique: true })
code: string; // código de materia ej: "CALC001"

@Column('text', { nullable: true })
description: string;

@Column()
credits: number;

@Column({ default: true })
isActive: boolean;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

// Relación inversa para obtener estadísticas
@OneToMany(() => SubjectDetails, sd => sd.subject)
assignments: SubjectDetails[];
```

### **Modificaciones a SubjectDetails entity**:
```typescript
// Renombrar a TeachingAssignment para mayor claridad
@Entity('teaching_assignments')
export class TeachingAssignment {
  // Campos de control temporal
  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  assignedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Auditoría
  @ManyToOne(() => User)
  assignedBy: User; // admin que hizo la asignación
}
```

### **Nuevo: AssignmentAuditLog**:
```typescript
@Entity()
export class AssignmentAuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeachingAssignment)
  assignment: TeachingAssignment;

  @Column({ 
    type: 'enum',
    enum: ['CREATED', 'ACTIVATED', 'DEACTIVATED', 'DELETED'] 
  })
  action: string;

  @ManyToOne(() => User)
  performedBy: User;

  @Column('json', { nullable: true })
  previousValues: any;

  @Column('json', { nullable: true })
  newValues: any;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  performedAt: Date;
}
```

---

## 📊 **Vista de Administración (UI Mockup)**

```
┌─────────────── Gestión de Materias y Asignaciones ────────────────┐
│                                                                   │
│  📋 Materias  👥 Asignaciones  📊 Reportes                        │
│                                                                   │
│  🔍 [Buscar materias...]                    [Nueva Materia]      │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ Código    │ Materia              │ Profesores │ Estado    │   │
│  ├───────────────────────────────────────────────────────────┤   │
│  │ CALC001   │ Cálculo Diferencial  │    3       │ ✅ Activa │   │
│  │ ALG001    │ Álgebra Lineal       │    2       │ ✅ Activa │   │  
│  │ FISI001   │ Física I             │    1       │ ❌ Inact. │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │  
│  📋 Vista por: ◉ Profesor  ○ Materia                             │
│                                                                   │
│  👨‍🏫 Dr. García                                 [Asignar Materia] │
│     • CALC001 - Cálculo Diferencial (25 sesiones)                │
│     • ALG001 - Álgebra Lineal (12 sesiones)                      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🧪 **Casos de Prueba Críticos**

1. **Creación de materia**: Admin crea nueva materia → Aparece en dropdowns después de asignar profesor
2. **Asignación**: Admin asigna profesor a materia → Profesor puede crear asesorías de esa materia
3. **Validación de permisos**: Profesor intenta crear asesoría de materia no asignada → Error 403
4. **Desactivación con dependencias**: Admin desactiva asignación con sesiones futuras → Opciones para manejar conflictos
5. **Estudiante sin matrícula**: Estudiante solicita asesoría de materia no matriculada → Error de validación
6. **Fechas de asignación**: Profesor con asignación vencida intenta crear asesoría → Error de validación temporal

---

*Última actualización: 31 de octubre de 2025*