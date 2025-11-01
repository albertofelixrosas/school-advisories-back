# Epic 1: Gestión de Solicitudes de Asesoría

**🏆 Prioridad: ALTA (MVP)** | **Complejidad: Alta** | **Sprint: 1**

---

## 📝 **Descripción de la Épica**

Como sistema universitario, necesitamos permitir que los estudiantes soliciten asesorías de manera formal y que los profesores puedan aprobar o rechazar estas solicitudes, creando un flujo controlado y con notificaciones automáticas.

**Valor de Negocio**: Reemplaza el sistema manual actual (WhatsApp, papel, Excel) con un flujo digital trazable.

---

## 🎯 **Historias de Usuario**

### **US-001: Estudiante crea solicitud de asesoría**

```gherkin
Como estudiante matriculado
Quiero crear una solicitud de asesoría especificando materia, tema y preferencias
Para que el profesor revise mi petición y la confirme o rechace

Given soy un estudiante autenticado
When navego a "Solicitar Asesoría"
Then veo solo las materias en las que estoy matriculado
And puedo seleccionar profesor (si hay múltiples para la materia)

When completo el formulario con:
  - Materia: [selección de dropdown]
  - Tema: "Derivadas e integrales" [texto libre]
  - Mensaje: "Necesito ayuda con ejercicios del examen" [textarea]
  - Horario preferido: [selección de disponibilidades del profesor]
  - Tipo de venue: Virtual/Presencial [radio buttons]
And hago clic en "Enviar Solicitud"
Then la solicitud se crea con status PENDING
And el profesor recibe notificación por email
And veo mensaje de confirmación: "Solicitud enviada. Recibirás respuesta por email."
And la solicitud aparece en "Mis Solicitudes" con estado "Pendiente"
```

**Criterios de Aceptación**:
- ✅ Solo materias de mi matrícula son visibles
- ✅ Validación: todos los campos requeridos
- ✅ Email automático al profesor con detalles de la solicitud
- ✅ Solicitud registrada con timestamp y estado PENDING
- ✅ Tema es texto libre (no hay catálogo de temas)

**Endpoints**:
```http
POST /api/advisory-requests
Body: {
  "subjectDetailId": 123,
  "topic": "string",
  "message": "string", 
  "preferredAvailabilityId": 456,
  "preferredVenueType": "VIRTUAL|PHYSICAL"
}

GET /api/advisory-requests/my-requests
Response: [{
  "id": 1,
  "status": "PENDING|APPROVED|REJECTED",
  "topic": "string",
  "createdAt": "ISO date",
  "professor": {"name": "string"},
  "subject": {"name": "string"}
}]
```

---

### **US-002: Profesor revisa y responde solicitudes**

```gherkin
Como profesor
Quiero revisar solicitudes pendientes de asesoría
Para aprobar o rechazar según mi disponibilidad y criterio académico

Given soy un profesor autenticado
When navego a "Solicitudes Pendientes"
Then veo lista de solicitudes para mis materias con:
  - Nombre del estudiante
  - Materia y tema solicitado
  - Mensaje del estudiante
  - Horario preferido del estudiante
  - Fecha de solicitud
  - Acciones: [Aprobar] [Rechazar]

When selecciono "Aprobar" en una solicitud
Then se abre modal con:
  - Fecha y hora específica [datetime picker]
  - Venue concreto [dropdown de venues disponibles]
  - Cupo máximo [number input, default: 1]
  - Notas adicionales [textarea, opcional]
And confirmo aprobación
Then solicitud cambia a APPROVED
And se crea sesión oficial (AdvisoryDate)
And estudiante recibe email con detalles confirmados

When selecciono "Rechazar" en una solicitud  
Then se abre modal con:
  - Motivo del rechazo [textarea, opcional]
And confirmo rechazo
Then solicitud cambia a REJECTED
And estudiante recibe email con notificación de rechazo
```

**Criterios de Aceptación**:
- ✅ Solo veo solicitudes para materias que imparto
- ✅ Al aprobar, debo especificar fecha/hora/venue específicos
- ✅ Se crea automáticamente sesión (AdvisoryDate) al aprobar
- ✅ Emails diferenciados para aprobación vs rechazo
- ✅ Motivo de rechazo es opcional pero recomendado

**Endpoints**:
```http
GET /api/advisory-requests/pending
Response: [{
  "id": 1,
  "student": {"name": "string", "email": "string"},
  "subject": {"name": "string"},
  "topic": "string",
  "message": "string",
  "preferredAvailability": {"day": "MONDAY", "time": "14:00-16:00"},
  "preferredVenueType": "VIRTUAL",
  "createdAt": "ISO date"
}]

PATCH /api/advisory-requests/:id/approve
Body: {
  "scheduledDate": "2025-11-15T14:00:00Z",
  "venueId": 5,
  "maxStudents": 2,
  "notes": "Traer calculadora"
}

PATCH /api/advisory-requests/:id/reject  
Body: {
  "rejectionReason": "No disponible en esa fecha"
}
```

---

### **US-003: Estudiante visualiza estado de solicitudes**

```gherkin
Como estudiante
Quiero ver el estado de mis solicitudes de asesoría
Para saber cuáles fueron aprobadas, rechazadas o están pendientes

Given tengo solicitudes creadas previamente
When navego a "Mis Solicitudes"
Then veo tabla con mis solicitudes ordenadas por fecha descendente:

For each solicitud PENDING:
  - Status: "⏳ Pendiente"
  - Materia, Profesor, Tema
  - Fecha solicitud
  - Acción: [Cancelar Solicitud]

For each solicitud APPROVED:
  - Status: "✅ Confirmada"  
  - Materia, Profesor, Tema
  - Fecha/Hora confirmada
  - Venue con dirección o enlace
  - Notas del profesor (si las hay)
  - Acción: [Cancelar Participación]

For each solicitud REJECTED:
  - Status: "❌ Rechazada"
  - Materia, Profesor, Tema  
  - Motivo del rechazo (si se proporcionó)
  - Acción: [Crear Nueva Solicitud]
```

**Criterios de Aceptación**:
- ✅ Veo histórico completo de mis solicitudes
- ✅ Estados claramente diferenciados visualmente
- ✅ Para aprobadas: detalles completos de fecha/lugar
- ✅ Para rechazadas: motivo si fue proporcionado
- ✅ Puedo cancelar solicitudes pendientes o participación en aprobadas

**Endpoints**: *Ya definidos en US-001*

---

### **US-004: Cancelación de solicitudes y sesiones**

```gherkin
Como estudiante  
Quiero cancelar una solicitud pendiente o mi participación en sesión confirmada
Para liberar el cupo cuando no pueda asistir

Given tengo una solicitud en estado PENDING
When hago clic en "Cancelar Solicitud"
Then aparece confirmación: "¿Seguro que deseas cancelar esta solicitud?"
When confirmo
Then solicitud cambia a CANCELLED
And profesor recibe email: "El estudiante X canceló su solicitud para [materia]"

Given tengo una solicitud en estado APPROVED (sesión confirmada)
When hago clic in "Cancelar Participación"  
Then aparece confirmación: "¿Seguro que deseas cancelar tu participación? El profesor será notificado."
When confirmo
Then mi participación se remueve de la sesión
And profesor recibe email: "El estudiante X canceló su participación en la asesoría de [fecha]"
And si era el único participante, la sesión se marca como CANCELLED
```

**Criterios de Aceptación**:
- ✅ Puedo cancelar solicitudes PENDING o participación en APPROVED
- ✅ No puedo cancelar solicitudes REJECTED (no tiene sentido)
- ✅ Cancelación requiere confirmación explícita
- ✅ Profesor siempre recibe notificación de cancelación
- ✅ Se registra quién y cuándo canceló (auditoría)

**Endpoints**:
```http
DELETE /api/advisory-requests/:id/cancel
# Para solicitudes PENDING

DELETE /api/advisory-sessions/:sessionId/participants/:studentId  
# Para remover participación de sesión confirmada
```

---

### **US-005: Profesor cancela sesión confirmada**

```gherkin
Como profesor
Quiero cancelar una sesión de asesoría ya confirmada  
Para casos donde no puedo realizarla por fuerza mayor

Given tengo una sesión en estado SCHEDULED con participantes confirmados
When navego a "Mis Sesiones Programadas"
And selecciono una sesión
And hago clic en "Cancelar Sesión"
Then aparece modal con:
  - Lista de estudiantes que serán afectados
  - Campo para motivo de cancelación [textarea, requerido]
  - Checkbox: "Ofrecer reprogramar" [opcional]
When completo motivo y confirmo
Then sesión cambia a CANCELLED  
And todos los estudiantes reciben email con:
  - Notificación de cancelación
  - Motivo proporcionado
  - Opción de contactar para reprogramar (si seleccioné checkbox)
```

**Criterios de Aceptación**:
- ✅ Solo puedo cancelar sesiones que yo imparto
- ✅ Motivo de cancelación es obligatorio
- ✅ Todos los participantes reciben notificación
- ✅ Opción de ofrecer reprogramación es opcional
- ✅ Se registra timestamp y motivo de cancelación

**Endpoints**:
```http
DELETE /api/advisory-sessions/:id/cancel
Body: {
  "cancellationReason": "Enfermedad del profesor",
  "offerRescheduling": true
}
```

---

## 🔧 **Cambios Técnicos Requeridos**

### **Nueva Entidad: AdvisoryRequest**
```typescript
export class AdvisoryRequest {
  @PrimaryGeneratedColumn()
  request_id: number;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => SubjectDetails) 
  subjectDetail: SubjectDetails;

  @Column()
  topic: string;

  @Column('text')
  message: string;

  @Column({ type: 'enum', enum: ['VIRTUAL', 'PHYSICAL'] })
  preferredVenueType: 'VIRTUAL' | 'PHYSICAL';

  @ManyToOne(() => AdvisorySchedule, { nullable: true })
  preferredAvailability: AdvisorySchedule;

  @Column({ 
    type: 'enum', 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  })
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

  @Column({ nullable: true })
  rejectionReason: string;

  @ManyToOne(() => AdvisoryDate, { nullable: true })
  approvedSession: AdvisoryDate; // Se crea al aprobar

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn() 
  updatedAt: Date;
}
```

### **Campos adicionales en entidades existentes**:
```typescript
// Advisory entity
@Column({ default: 1 })
maxStudents: number;

@Column({ 
  type: 'enum',
  enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
  default: 'SCHEDULED' 
})
status: string;

@ManyToOne(() => User)
createdBy: User;

@ManyToOne(() => User, { nullable: true })
cancelledBy: User;

@Column({ nullable: true })
cancellationReason: string;

@Column({ nullable: true })
cancelledAt: Date;
```

---

## 📧 **Templates de Email**

### **Notificación a Profesor (Nueva Solicitud)**
```
Asunto: Nueva solicitud de asesoría - [Materia]

Hola [Nombre Profesor],

El estudiante [Nombre Estudiante] ha solicitado una asesoría para:

📚 Materia: [Nombre Materia]
📝 Tema: [Tema solicitado]
💬 Mensaje: [Mensaje del estudiante]
🕐 Horario preferido: [Día y hora]
📍 Preferencia: [Virtual/Presencial]

Para revisar y responder:
👉 [Enlace a plataforma]/requests/pending

Saludos,
Sistema de Asesorías ITSON
```

### **Notificación a Estudiante (Solicitud Aprobada)**
```
Asunto: ✅ Asesoría confirmada - [Materia]

Hola [Nombre Estudiante],

Tu solicitud de asesoría ha sido APROBADA:

📚 Materia: [Nombre Materia]  
👨‍🏫 Profesor: [Nombre Profesor]
📅 Fecha y hora: [Fecha y hora confirmada]
📍 Lugar: [Detalles del venue + enlace si es virtual]
👥 Cupo: [X estudiantes máximo]

📝 Notas del profesor: [Notas si las hay]

¡No olvides asistir puntualmente!

[Enlace a plataforma]/my-requests

Saludos,
Sistema de Asesorías ITSON
```

---

## 🧪 **Casos de Prueba Críticos**

1. **Happy Path**: Estudiante solicita → Profesor aprueba → Sesión creada → Emails enviados
2. **Rechazo**: Estudiante solicita → Profesor rechaza con motivo → Email de rechazo
3. **Cancelación por estudiante**: Solicitud pending → Estudiante cancela → Profesor notificado
4. **Cancelación por profesor**: Sesión confirmada → Profesor cancela → Estudiantes notificados
5. **Validaciones**: Estudiante intenta solicitar materia no matriculada → Error 403
6. **Carga**: 50 solicitudes simultáneas → Sistema responde < 2 segundos

---

*Última actualización: 31 de octubre de 2025*