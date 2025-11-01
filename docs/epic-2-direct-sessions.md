# Epic 2: Creación Directa y Registro de Asistencia

**🏆 Prioridad: ALTA (MVP)** | **Complejidad: Media** | **Sprint: 2**

---

## 📝 **Descripción de la Épica**

Como profesor, necesito poder crear sesiones de asesoría directamente (sin solicitud previa) y registrar la asistencia de los estudiantes al finalizar la sesión, manteniendo un registro oficial para reportes administrativos.

**Valor de Negocio**: Flexibilidad para asesorías improvisadas y digitización del registro de asistencia manual (papel/Excel).

---

## 🎯 **Historias de Usuario**

### **US-006: Profesor crea sesión de asesoría directa**

```gherkin
Como profesor
Quiero crear una sesión de asesoría directamente sin solicitud previa
Para casos de asesorías improvisadas o planificadas por mi cuenta

Given soy un profesor autenticado
When navego a "Crear Sesión Directa"
Then veo formulario con:
  - Materia: [dropdown de materias que imparto]
  - Tema: [texto libre] 
  - Fecha y hora: [datetime picker]
  - Venue: [dropdown de venues disponibles]
  - Cupo máximo: [number input, default: 1, max: 20]
  - Tipo de sesión: [Radio] Abierta / Solo invitados
  - Estudiantes invitados: [multiselect, solo si "Solo invitados"]
  - Notas: [textarea, opcional]

When completo formulario y hago clic en "Crear Sesión"
Then se crea sesión en estado SCHEDULED
And si seleccioné "Solo invitados", se envían emails a estudiantes
And si seleccioné "Abierta", queda disponible para inscripción libre
And aparece confirmación: "Sesión creada exitosamente"
And sesión aparece en "Mis Sesiones Programadas"
```

**Criterios de Aceptación**:
- ✅ Solo puedo seleccionar materias que imparto (SubjectDetails)
- ✅ Fecha/hora no puede ser en el pasado
- ✅ Si venue es VIRTUAL, debe tener URL de reunión
- ✅ Estudiantes invitados deben estar matriculados en la materia
- ✅ Sesión abierta permite inscripción hasta alcanzar cupo máximo
- ✅ Se registra quién creó la sesión (created_by)

**Endpoints**:
```http
POST /api/advisory-sessions/direct
Body: {
  "subjectDetailId": 123,
  "topic": "Repaso para examen final",
  "scheduledDate": "2025-11-20T14:00:00Z",
  "venueId": 5,
  "maxStudents": 3,
  "sessionType": "OPEN|INVITATION_ONLY",
  "invitedStudents": [101, 102], // solo si INVITATION_ONLY
  "notes": "Traer calculadora científica"
}

GET /api/advisory-sessions/my-sessions
Response: [{
  "id": 1,
  "topic": "string",
  "scheduledDate": "ISO date",
  "venue": {"name": "string", "type": "VIRTUAL|CLASSROOM|OFFICE"},
  "status": "SCHEDULED|COMPLETED|CANCELLED",
  "participantCount": 2,
  "maxStudents": 3
}]
```

---

### **US-007: Estudiante se inscribe en sesión abierta**

```gherkin
Como estudiante
Quiero inscribirme en sesiones abiertas de profesores  
Para asistir a asesorías de materias en las que estoy matriculado

Given hay sesiones abiertas disponibles
When navego a "Asesorías Disponibles"  
Then veo lista de sesiones abiertas para mis materias con:
  - Materia y profesor
  - Tema de la asesoría
  - Fecha y hora
  - Lugar (con enlace si es virtual)
  - Cupos disponibles: "2/5 ocupados"
  - Estado: "Disponible" | "Lleno" | "Pasado"

When hago clic en "Inscribirme" en una sesión disponible
Then aparece confirmación: "¿Confirmas tu inscripción a esta asesoría?"
When confirmo
Then me agrego como participante
And recibo email de confirmación con detalles
And sesión aparece en "Mis Asesorías Programadas"
And cupo se actualiza: "3/5 ocupados"

Given una sesión está llena
Then botón aparece como "Lleno" (deshabilitado)
And puedo hacer clic en "Unirme a lista de espera" [opcional para v2]
```

**Criterios de Aceptación**:
- ✅ Solo veo sesiones de materias donde estoy matriculado
- ✅ No puedo inscribirme si sesión está llena
- ✅ No puedo inscribirme si ya soy participante
- ✅ No puedo inscribirme si la fecha ya pasó
- ✅ Recibo confirmación por email al inscribirme
- ✅ Puedo cancelar mi inscripción hasta 1 hora antes (configurable)

**Endpoints**:
```http
GET /api/advisory-sessions/available
Query params: ?studentId=123&upcoming=true
Response: [{
  "id": 1,
  "subject": {"name": "Cálculo Diferencial"},
  "professor": {"name": "Dr. García"},
  "topic": "Derivadas",
  "scheduledDate": "ISO date",
  "venue": {"name": "Aula 205", "type": "CLASSROOM"},
  "participantCount": 2,
  "maxStudents": 5,
  "canEnroll": true
}]

POST /api/advisory-sessions/:id/enroll
# Sin body, usa JWT para identificar estudiante

DELETE /api/advisory-sessions/:id/unenroll  
# Cancelar inscripción propia
```

---

### **US-008: Profesor registra asistencia de sesión**

```gherkin
Como profesor  
Quiero marcar la asistencia de estudiantes al finalizar una sesión
Para mantener registro oficial de quiénes asistieron realmente

Given tengo una sesión en estado SCHEDULED con participantes inscritos  
When la sesión ha comenzado o terminado
And navego a "Mis Sesiones" → [sesión específica]
Then veo detalles de la sesión:
  - Información básica (fecha, materia, tema, venue)
  - Lista de participantes inscritos
  - Botón "Registrar Asistencia" (habilitado solo si es el día de la sesión)

When hago clic en "Registrar Asistencia"
Then veo formulario con:
  - Lista de participantes con checkbox "Asistió" por cada uno
  - Campo "Temas tratados": [textarea]
  - Campo "Observaciones": [textarea, opcional]
  - Campo "Duración real": [time picker, default: duración programada]

When marco/desmarco checkboxes de asistencia
And completo temas tratados  
And hago clic en "Guardar Asistencia"
Then se registra asistencia por cada participante
And sesión cambia a estado COMPLETED  
And se guarda timestamp de cuando registré la asistencia
And aparece confirmación: "Asistencia registrada exitosamente"
```

**Criterios de Aceptación**:
- ✅ Solo puedo registrar asistencia de sesiones que yo imparto
- ✅ Solo puedo registrar asistencia el día de la sesión o después
- ✅ Puedo modificar asistencia si la sesión sigue COMPLETED (no ARCHIVED)
- ✅ "Temas tratados" es campo obligatorio
- ✅ Se registra timestamp exacto de cuando marqué asistencia
- ✅ Una vez registrada, sesión no se puede cancelar

**Endpoints**:
```http
GET /api/advisory-sessions/:id/attendance-form
Response: {
  "session": {
    "id": 1,
    "topic": "string",
    "scheduledDate": "ISO date",
    "participants": [
      {"id": 101, "name": "Juan Pérez", "email": "juan@mail.com"}
    ]
  }
}

POST /api/advisory-sessions/:id/attendance
Body: {
  "attendanceRecords": [
    {"studentId": 101, "attended": true},
    {"studentId": 102, "attended": false}
  ],
  "topicsCovered": "Derivadas de funciones trigonométricas",
  "observations": "Estudiante Juan necesita refuerzo en regla de la cadena",
  "actualDuration": 90 // minutos
}

PATCH /api/advisory-sessions/:id/complete
# Cambia estado a COMPLETED después de registrar asistencia
```

---

### **US-009: Visualización de historial de sesiones**

```gherkin
Como profesor
Quiero ver el historial de todas mis sesiones realizadas
Para consultar registros de asistencia y hacer seguimiento

Given tengo sesiones completadas previamente
When navego a "Historial de Sesiones"
Then veo tabla con filtros:
  - Rango de fechas [date picker]
  - Materia [dropdown]
  - Estado [dropdown: Todas, Completadas, Canceladas]

And veo lista paginada con:
  - Fecha de sesión
  - Materia y tema
  - Participantes inscritos vs asistentes: "3/5 asistieron"
  - Estado: "Completada" | "Cancelada"
  - Acciones: [Ver Detalles] [Descargar Reporte]

When hago clic en "Ver Detalles" de una sesión completada
Then veo vista detallada con:
  - Información completa de la sesión
  - Lista de participantes con estado de asistencia
  - Temas tratados durante la sesión
  - Observaciones del profesor
  - Duración real vs programada
  - Timestamp de registro de asistencia
```

**Criterios de Aceptación**:
- ✅ Solo veo sesiones que yo impartí
- ✅ Filtros funcionan correctamente y se mantienen
- ✅ Paginación para manejar grandes volúmenes
- ✅ Vista detallada muestra toda la información registrada
- ✅ "Descargar Reporte" genera PDF/Excel con datos de la sesión

**Endpoints**:
```http
GET /api/advisory-sessions/history
Query params: ?professorId=123&startDate=2025-01-01&endDate=2025-12-31&subjectId=456&status=COMPLETED
Response: {
  "sessions": [{
    "id": 1,
    "scheduledDate": "ISO date",
    "subject": {"name": "string"},
    "topic": "string", 
    "participantCount": 3,
    "attendeeCount": 2,
    "status": "COMPLETED"
  }],
  "pagination": {"page": 1, "totalPages": 5}
}

GET /api/advisory-sessions/:id/details
Response: {
  "session": {...},
  "attendanceRecords": [
    {"student": {"name": "string"}, "attended": true}
  ],
  "topicsCovered": "string",
  "observations": "string",
  "actualDuration": 90,
  "attendanceRegisteredAt": "ISO date"
}
```

---

## 🔧 **Cambios Técnicos Requeridos**

### **Modificaciones a entidad Advisory/Session**:
```typescript
// Agregar campos adicionales
@Column({ default: 'SCHEDULED' })
status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

@Column({ type: 'enum', enum: ['OPEN', 'INVITATION_ONLY'] })
sessionType: 'OPEN' | 'INVITATION_ONLY';

@Column({ default: 1 })
maxStudents: number;

@Column('text', { nullable: true })
topicsCovered: string;

@Column('text', { nullable: true })
observations: string;

@Column({ nullable: true })
actualDuration: number; // en minutos

@Column({ nullable: true })
attendanceRegisteredAt: Date;

@ManyToOne(() => User)
createdBy: User;
```

### **Nueva entidad: SessionParticipant**:
```typescript
@Entity()
export class SessionParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AdvisoryDate)
  session: AdvisoryDate;

  @ManyToOne(() => User)  
  student: User;

  @Column({ default: false })
  attended: boolean;

  @Column({ 
    type: 'enum',
    enum: ['ENROLLED', 'ATTENDED', 'ABSENT', 'CANCELLED'],
    default: 'ENROLLED'
  })
  status: string;

  @CreateDateColumn()
  enrolledAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### **Modificación a entidad Venue**:
```typescript
// Agregar URL para venues virtuales
@Column({ nullable: true })
meetingUrl: string;

@Column({ default: true })
isActive: boolean;

@Column({ nullable: true })
capacity: number; // capacidad máxima del venue
```

---

## 📧 **Templates de Email**

### **Invitación a Sesión (Solo invitados)**
```
Asunto: Invitación a asesoría - [Materia]

Hola [Nombre Estudiante],

Has sido invitado a una asesoría:

📚 Materia: [Nombre Materia]
👨‍🏫 Profesor: [Nombre Profesor]  
📝 Tema: [Tema de la sesión]
📅 Fecha y hora: [Fecha y hora]
📍 Lugar: [Detalles del venue + enlace si es virtual]

📝 Notas del profesor: [Notas si las hay]

Esta invitación confirma tu participación automáticamente.
Si no puedes asistir, cancela tu participación:
👉 [Enlace]/my-sessions

¡Te esperamos!

Sistema de Asesorías ITSON
```

### **Confirmación de Inscripción (Sesión abierta)**
```
Asunto: Inscripción confirmada - [Materia]

Hola [Nombre Estudiante],

Tu inscripción ha sido confirmada:

📚 Materia: [Nombre Materia]
👨‍🏫 Profesor: [Nombre Profesor]
📝 Tema: [Tema]  
📅 Fecha y hora: [Fecha y hora]
📍 Lugar: [Detalles + enlace si virtual]

Cupos: [X/Y ocupados]

Si no puedes asistir, cancela tu inscripción con al menos 1 hora de anticipación:
👉 [Enlace]/my-sessions

¡Nos vemos en la asesoría!

Sistema de Asesorías ITSON
```

---

## 🧪 **Casos de Prueba Críticos**

1. **Creación directa**: Profesor crea sesión → Invitados reciben email → Sesión visible en calendario
2. **Inscripción abierta**: Estudiante se inscribe → Cupo se actualiza → Email de confirmación
3. **Registro de asistencia**: Profesor marca asistencia → Sesión COMPLETED → Datos guardados
4. **Cupo lleno**: Estudiante intenta inscribirse en sesión llena → Error 400
5. **Cancelación tarde**: Estudiante cancela 30min antes → Validar regla de tiempo mínimo
6. **Modificar asistencia**: Profesor cambia asistencia después de registrarla → Auditoría correcta

---

*Última actualización: 31 de octubre de 2025*