# Epic 3: Disponibilidad y Horarios

**🏆 Prioridad: MEDIA** | **Complejidad: Media** | **Sprint: 3**

---

## 📝 **Descripción de la Épica**

Como profesor, necesito configurar mis horarios de disponibilidad recurrentes para que los estudiantes sepan cuándo pueden solicitar asesorías, y como estudiante necesito visualizar esta disponibilidad para hacer solicitudes en horarios apropiados.

**Valor de Negocio**: Reduce fricciones en el proceso de solicitud y mejora la planificación tanto para profesores como estudiantes.

---

## 🎯 **Historias de Usuario**

### **US-010: Profesor configura disponibilidad recurrente**

```gherkin
Como profesor
Quiero configurar mis horarios de disponibilidad recurrentes para asesorías
Para que los estudiantes sepan cuándo pueden solicitar citas conmigo

Given soy un profesor autenticado
When navego a "Mi Disponibilidad"
Then veo mi horario semanal actual con franjas configuradas (si las hay)
And veo botón "Agregar Nueva Franja"

When hago clic en "Agregar Nueva Franja"
Then aparece modal con:
  - Día de la semana: [dropdown: Lunes-Domingo]
  - Hora inicio: [time picker]
  - Hora fin: [time picker]
  - Venue por defecto: [dropdown de venues]
  - Cupo máximo por sesión: [number, default: 1]
  - Materias aplicables: [multiselect de materias que imparto]
  - Activa: [checkbox, default: true]

When completo formulario válido y guardo
Then se crea nueva franja de disponibilidad
And aparece en mi vista de horario semanal
And está disponible para que estudiantes la vean al solicitar

Given tengo una franja existente
When hago clic en ella en el horario
Then puedo editarla o desactivarla temporalmente
When marco "Activa: false"
Then deja de aparecer para estudiantes pero se mantiene guardada
```

**Criterios de Aceptación**:
- ✅ Hora fin debe ser posterior a hora inicio
- ✅ No puedo crear franjas que se sobrepongan
- ✅ Solo puedo seleccionar materias que imparto
- ✅ Puedo desactivar franjas temporalmente sin borrarlas
- ✅ Cambios son efectivos inmediatamente para nuevas solicitudes
- ✅ Vista semanal muestra todas mis franjas de forma clara

**Endpoints**:
```http
POST /api/availability/recurring
Body: {
  "dayOfWeek": "MONDAY",
  "startTime": "14:00",
  "endTime": "16:00", 
  "defaultVenueId": 5,
  "maxStudentsPerSlot": 2,
  "applicableSubjects": [123, 124],
  "isActive": true
}

GET /api/availability/my-schedule
Response: [{
  "id": 1,
  "dayOfWeek": "MONDAY",
  "startTime": "14:00",
  "endTime": "16:00",
  "defaultVenue": {"name": "Oficina 205"},
  "maxStudentsPerSlot": 2,
  "applicableSubjects": [{"name": "Cálculo"}],
  "isActive": true
}]

PUT /api/availability/:id
PATCH /api/availability/:id/toggle-active
DELETE /api/availability/:id
```

---

### **US-011: Estudiante visualiza disponibilidad de profesores**

```gherkin
Como estudiante
Quiero ver la disponibilidad de profesores de mis materias
Para solicitar asesorías en horarios donde el profesor está disponible

Given estoy matriculado en materias con profesores asignados  
When navego a "Solicitar Asesoría"
And selecciono una materia del dropdown
Then se actualiza automáticamente el dropdown de profesores
And al seleccionar un profesor, veo su disponibilidad semanal:

Vista de horario semanal mostrando:
  - Franjas disponibles en verde: "Lun 14:00-16:00 (Oficina 205)"
  - Franjas no disponibles en gris: "Mar (Sin disponibilidad)"
  - Cupos por franja: "Máximo 2 estudiantes por sesión"

When hago clic en una franja disponible
Then se preselecciona automáticamente en el formulario de solicitud
And veo venue por defecto y cupo máximo de esa franja
And puedo proceder con el resto del formulario de solicitud

Given un profesor no tiene disponibilidad configurada
Then veo mensaje: "Este profesor no ha configurado horarios de disponibilidad. Puedes enviar una solicitud abierta."
And puedo crear solicitud sin horario específico
```

**Criterios de Aceptación**:
- ✅ Solo veo disponibilidad de profesores de mis materias matriculadas
- ✅ Solo veo franjas activas (isActive=true)
- ✅ Vista es clara y fácil de entender visualmente
- ✅ Al seleccionar franja, datos se prellenan en formulario
- ✅ Si profesor no tiene disponibilidad, puedo solicitar de forma abierta
- ✅ Vista se actualiza en tiempo real si profesor cambia disponibilidad

**Endpoints**:
```http
GET /api/availability/professor/:id/schedule
Query params: ?studentId=123 (para validar matriculación)
Response: [{
  "id": 1,
  "dayOfWeek": "MONDAY", 
  "startTime": "14:00",
  "endTime": "16:00",
  "defaultVenue": {"name": "Oficina 205", "type": "OFFICE"},
  "maxStudentsPerSlot": 2,
  "applicableForStudent": true // si estudiante está matriculado en materias de esta franja
}]

GET /api/professors/:id/availability-summary
Response: {
  "hasAvailability": true,
  "totalSlots": 5,
  "subjects": ["Cálculo", "Álgebra"]
}
```

---

### **US-012: Gestión de disponibilidad excepcional**

```gherkin
Como profesor  
Quiero marcar días específicos como no disponibles o con horario especial
Para manejar vacaciones, conferencias, o cambios puntuales en mi agenda

Given tengo disponibilidad recurrente configurada
When navego a "Mi Disponibilidad" → "Excepciones"
Then veo calendario mensual con:
  - Días normales: horario recurrente aplicado
  - Días con excepciones: marcados diferente  
  - Botón "Agregar Excepción"

When hago clic en "Agregar Excepción"
Then aparece modal con:
  - Fecha específica: [date picker]
  - Tipo: [radio] No disponible / Horario especial
  - Si "Horario especial":
    - Horario modificado: [time pickers]
    - Venue alternativo: [dropdown]
    - Cupo alternativo: [number]

When marco fecha como "No disponible"
Then esa fecha no aparece como opción para estudiantes
And solicitudes existentes para esa fecha reciben notificación de cambio

When marco "Horario especial"  
Then estudiantes ven el horario modificado para esa fecha específica
And el horario especial sobrescribe el recurrente solo para ese día
```

**Criterios de Aceptación**:
- ✅ Excepciones solo afectan fechas específicas, no la regla recurrente
- ✅ "No disponible" bloquea completamente el día
- ✅ "Horario especial" permite modificar horario solo para esa fecha
- ✅ Estudiantes ven automáticamente los cambios al solicitar
- ✅ Puedo eliminar excepciones para volver al horario recurrente
- ✅ Notificaciones automáticas si hay solicitudes afectadas

**Endpoints**:
```http
POST /api/availability/exceptions
Body: {
  "date": "2025-12-25",
  "type": "UNAVAILABLE|SPECIAL_SCHEDULE",
  "specialSchedule": {
    "startTime": "10:00",
    "endTime": "12:00",
    "venueId": 6,
    "maxStudents": 1
  }
}

GET /api/availability/exceptions/:professorId/:month
Response: [{
  "date": "2025-12-25",
  "type": "UNAVAILABLE",
  "reason": "Vacaciones navideñas"
}]

DELETE /api/availability/exceptions/:id
```

---

## 🔧 **Cambios Técnicos Requeridos**

### **Renombrar AdvisorySchedule → Availability**:
```typescript
@Entity('availabilities') // cambiar nombre de tabla
export class Availability {
  @PrimaryGeneratedColumn()
  availability_id: number; // antes: advisory_schedule_id

  @Column({ type: 'enum', enum: WeekDay })
  dayOfWeek: WeekDay; // antes: day

  @Column({ type: 'time' })
  startTime: string; // antes: begin_time

  @Column({ type: 'time' })  
  endTime: string; // antes: end_time

  @ManyToOne(() => User) // profesor
  professor: User;

  @ManyToOne(() => Venue)
  defaultVenue: Venue;

  @Column({ default: 1 })
  maxStudentsPerSlot: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => SubjectDetails)
  @JoinTable()
  applicableSubjects: SubjectDetails[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### **Nueva entidad: AvailabilityException**:
```typescript
@Entity()
export class AvailabilityException {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  professor: User;

  @Column({ type: 'date' })
  date: string;

  @Column({ 
    type: 'enum',
    enum: ['UNAVAILABLE', 'SPECIAL_SCHEDULE'] 
  })
  type: 'UNAVAILABLE' | 'SPECIAL_SCHEDULE';

  @Column({ type: 'time', nullable: true })
  specialStartTime: string;

  @Column({ type: 'time', nullable: true })
  specialEndTime: string;

  @ManyToOne(() => Venue, { nullable: true })
  specialVenue: Venue;

  @Column({ nullable: true })
  specialMaxStudents: number;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### **Modificación a AdvisoryRequest**:
```typescript
// Agregar relación opcional a availability específica
@ManyToOne(() => Availability, { nullable: true })  
preferredAvailability: Availability;

// Agregar campos para solicitudes sin horario específico
@Column({ default: false })
isOpenRequest: boolean; // solicitud sin horario específico

@Column({ nullable: true })
preferredTimeDescription: string; // "Por las tardes" o similar
```

---

## 📊 **Vista de Disponibilidad (UI Mockup)**

```
┌─────────────────── Mi Disponibilidad ──────────────────┐
│                                                        │
│  [Agregar Nueva Franja]                    [Excepciones] │
│                                                        │
│     LUNES    MARTES   MIÉRCOLES  JUEVES   VIERNES     │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐   │
│  │ 14:00-  │    -    │ 10:00-  │ 16:00-  │    -    │   │ 
│  │ 16:00   │         │ 12:00   │ 18:00   │         │   │
│  │ Oficina │         │ Aula 101│ Virtual │         │   │
│  │ Max: 2  │         │ Max: 5  │ Max: 1  │         │   │
│  │ ✅ Activa│         │ ✅ Activa│ ❌ Pausada│         │   │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘   │
│                                                        │
│  📋 Materias aplicables:                               │
│  • Cálculo Diferencial                                │
│  • Álgebra Lineal                                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🧪 **Casos de Prueba Críticos**

1. **Configuración básica**: Profesor crea franja → Estudiante la ve → Puede solicitar en esa franja
2. **Sobreposición**: Profesor intenta crear franja que se sobrepone → Error de validación
3. **Desactivación**: Profesor desactiva franja → Deja de aparecer para estudiantes inmediatamente
4. **Excepción**: Profesor marca día no disponible → Estudiantes no pueden solicitar ese día
5. **Horario especial**: Profesor cambia horario para fecha específica → Estudiantes ven horario modificado
6. **Sin disponibilidad**: Profesor sin franjas configuradas → Estudiante puede hacer solicitud abierta

---

## 📧 **Templates de Email**

### **Notificación de Cambio de Disponibilidad**
```
Asunto: Cambio en disponibilidad - [Profesor]

Hola [Estudiante],

El profesor [Nombre] ha modificado su disponibilidad para el [Fecha]:

❌ Horario anterior: [Horario original]
✅ Nuevo horario: [Nuevo horario] / No disponible

Si tienes una solicitud pendiente para esta fecha, podrías necesitar:
• Esperar confirmación con nuevo horario
• Solicitar fecha alternativa

Revisa el estado de tus solicitudes:
👉 [Enlace]/my-requests

Saludos,
Sistema de Asesorías ITSON
```

---

*Última actualización: 31 de octubre de 2025*