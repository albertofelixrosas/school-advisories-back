# Epic 6: Sistema de Notificaciones

## 📋 Descripción
Sistema de notificaciones por email para mantener informados a usuarios sobre solicitudes, confirmaciones, cancelaciones y recordatorios de asesorías.

## 👥 Roles Involucrados
- **Administrador**: Configura plantillas y ve logs de notificaciones
- **Profesor**: Recibe notificaciones de solicitudes y cancelaciones
- **Estudiante**: Recibe confirmaciones, rechazos y recordatorios

---

## 📖 Historias de Usuario

### US-025: Notificaciones de solicitudes de asesoría
**Como** profesor  
**Quiero** recibir email cuando un estudiante solicite asesoría  
**Para** revisar y responder oportunamente

#### Criterios de Aceptación
✅ Recibo email inmediatamente cuando estudiante crea solicitud  
✅ Email incluye: datos del estudiante, materia, tema, mensaje, horario preferido  
✅ Email contiene enlaces para aprobar/rechazar directamente  
✅ No recibo notificación si soy admin que cancela  
✅ Puedo configurar frecuencia (inmediata/diaria/desactivada)  
✅ Template personalizable con datos de la institución

#### Plantilla de Email
```html
Asunto: Nueva solicitud de asesoría - [Materia] - [Estudiante]

Hola [Profesor],

El estudiante [Nombre] ([Email]) ha solicitado una asesoría para la materia [Materia].

Detalles de la solicitud:
- Tema: [Tema]
- Mensaje: [Mensaje del estudiante]
- Horario preferido: [Día y hora]
- Tipo preferido: [Presencial/Virtual]

[Botón: Aprobar Solicitud] [Botón: Rechazar Solicitud]

O accede al sistema: [URL del sistema]
```

#### Endpoints Sugeridos
```http
POST /notifications/advisory-request     # Enviar notificación de solicitud
PUT  /users/me/notification-preferences  # Configurar preferencias
```

---

### US-026: Notificaciones de respuesta a solicitudes
**Como** estudiante  
**Quiero** recibir email cuando el profesor responda mi solicitud  
**Para** saber si fue aprobada o rechazada

#### Criterios de Aceptación
✅ Recibo email cuando profesor aprueba/rechaza solicitud  
✅ Si aprobada: incluye fecha, hora, lugar/enlace confirmados  
✅ Si rechazada: incluye motivo si el profesor lo proporcionó  
✅ Email incluye botón para cancelar mi participación (si aprobada)  
✅ Para asesorías virtuales: incluye enlace de acceso  
✅ Incluye datos de contacto del profesor

#### Plantillas de Email

**Solicitud Aprobada:**
```html
Asunto: ✅ Asesoría confirmada - [Materia] - [Fecha]

Hola [Estudiante],

Tu solicitud de asesoría ha sido APROBADA por el profesor [Nombre].

Detalles de la asesoría:
- Materia: [Materia]
- Fecha y hora: [Día, fecha, hora]
- Lugar: [Venue] / Enlace: [URL si es virtual]
- Profesor: [Nombre] ([Email de contacto])

[Botón: Cancelar mi participación]

¡Te esperamos!
```

**Solicitud Rechazada:**
```html
Asunto: ❌ Solicitud de asesoría no aprobada - [Materia]

Hola [Estudiante],

Lamentamos informarte que tu solicitud de asesoría no pudo ser aprobada.

Motivo: [Motivo del profesor o "No especificado"]

Te sugerimos:
- Revisar otros horarios disponibles del profesor
- Contactar directamente al profesor: [Email]
- Solicitar asesoría con otro profesor de la materia

[Botón: Ver otros horarios disponibles]
```

---

### US-027: Notificaciones de cancelación
**Como** estudiante o profesor  
**Quiero** recibir email cuando se cancele una asesoría  
**Para** estar informado y reagendar si es necesario

#### Criterios de Aceptación
✅ Estudiante recibe email si profesor cancela sesión  
✅ Profesor recibe email si estudiante cancela participación  
✅ Admin NO envía notificaciones cuando cancela  
✅ Email incluye motivo de cancelación si se proporcionó  
✅ Email sugiere acciones alternativas (reagendar, otro profesor)  
✅ Se envía con al menos 1 hora de anticipación cuando es posible

#### Plantilla de Cancelación
```html
Asunto: 🚫 Asesoría cancelada - [Materia] - [Fecha]

Hola [Destinatario],

La asesoría programada ha sido cancelada por [Quien cancela].

Detalles de la asesoría cancelada:
- Materia: [Materia]
- Fecha y hora original: [Fecha y hora]
- Motivo: [Motivo o "No especificado"]

Acciones sugeridas:
[Para estudiante: Ver otros horarios | Contactar profesor]
[Para profesor: Reagendar | Contactar estudiante]
```

---

### US-028: Recordatorios de asesorías próximas
**Como** estudiante y profesor  
**Quiero** recibir recordatorio antes de la asesoría  
**Para** no olvidar la cita programada

#### Criterios de Aceptación
✅ Recordatorio se envía 24 horas antes de la asesoría  
✅ Recordatorio adicional 1 hora antes (opcional)  
✅ Email incluye todos los detalles: fecha, hora, lugar/enlace  
✅ Para asesorías virtuales: enlace directo de acceso  
✅ Incluye botón para cancelar si es necesario  
✅ No enviar recordatorio si asesoría ya fue cancelada

#### Plantilla de Recordatorio
```html
Asunto: 🔔 Recordatorio: Asesoría mañana - [Materia]

Hola [Nombre],

Te recordamos que tienes una asesoría programada:

📅 Fecha: [Día, fecha]
🕐 Hora: [Hora]
📍 Lugar: [Venue] / 💻 Enlace: [URL si es virtual]
📚 Materia: [Materia]
👨‍🏫 Profesor: [Nombre] ([Email])

[Botón: Acceder a asesoría virtual] [Botón: Cancelar participación]

¡Nos vemos pronto!
```

#### Implementación Técnica
```typescript
@Cron('0 10 * * *') // Todos los días a las 10:00 AM
async sendDailyReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const upcomingAdvisories = await this.findAdvisoriesByDate(tomorrow);
  
  for (const advisory of upcomingAdvisories) {
    await this.sendReminderEmail(advisory);
  }
}
```

---

### US-029: Configuración de preferencias de notificación
**Como** usuario (profesor/estudiante)  
**Quiero** configurar mis preferencias de notificaciones  
**Para** recibir solo los emails que me interesan

#### Criterios de Aceptación
✅ Puedo activar/desactivar cada tipo de notificación  
✅ Puedo elegir frecuencia: inmediata, diaria, semanal  
✅ Puedo cambiar email de destino  
✅ Configuración se guarda y aplica inmediatamente  
✅ Valores por defecto sensatos según rol  
✅ Interfaz intuitiva en perfil de usuario

#### Tipos de Notificación Configurables
- **Solicitudes recibidas** (profesor): inmediata/diaria/off
- **Respuestas a solicitudes** (estudiante): inmediata/off
- **Cancelaciones**: inmediata/off
- **Recordatorios**: 24h antes/1h antes/ambos/off
- **Reportes semanales** (admin): semanal/off

#### Endpoints Sugeridos
```http
GET /users/me/notification-preferences    # Obtener preferencias actuales
PUT /users/me/notification-preferences    # Actualizar preferencias
```

---

### US-030: Admin gestiona plantillas de notificación
**Como** administrador  
**Quiero** personalizar plantillas de email  
**Para** adaptar mensajes al tono y marca de la institución

#### Criterios de Aceptación
✅ Puedo editar subject y body de cada tipo de email  
✅ Plantillas soportan variables dinámicas {{variable}}  
✅ Preview de plantilla con datos de ejemplo  
✅ Validación de variables requeridas  
✅ Backup automático antes de cambios  
✅ Posibilidad de restaurar plantilla por defecto  
✅ Logo e información de institución configurable

#### Variables Disponibles
```typescript
interface EmailVariables {
  // Usuario
  recipientName: string;
  recipientEmail: string;
  
  // Asesoría
  subjectName: string;
  professorName: string;
  professorEmail: string;
  studentName: string;
  date: string;
  time: string;
  venue: string;
  virtualLink?: string;
  topic: string;
  message: string;
  
  // Sistema
  institutionName: string;
  systemUrl: string;
  logoUrl: string;
}
```

---

### US-031: Logs y monitoreo de notificaciones
**Como** administrador  
**Quiero** ver logs de notificaciones enviadas  
**Para** monitorear el sistema y debuggear problemas

#### Criterios de Aceptación
✅ Log de todos los emails enviados con timestamp  
✅ Estado de entrega (enviado/fallido/pendiente)  
✅ Filtros por usuario, tipo de notificación, fecha  
✅ Métricas de tasas de apertura y clicks (si disponible)  
✅ Alertas para tasas altas de fallas  
✅ Reintento automático para emails fallidos

#### Endpoints Sugeridos
```http
GET /admin/notification-logs             # Ver logs de notificaciones
GET /admin/notification-stats            # Estadísticas de entrega
POST /admin/notifications/:id/retry      # Reintentar envío fallido
```

---

## 🔄 Flujos de Proceso

### Flujo: Envío de Notificación
1. **Evento disparador** ocurre (nueva solicitud, aprobación, etc.)
2. **Sistema identifica** destinatarios según el evento
3. **Sistema consulta** preferencias de notificación del usuario
4. **Si notificaciones activas**: procede, sino termina
5. **Sistema carga** plantilla correspondiente
6. **Sistema reemplaza** variables con datos reales
7. **Sistema envía** email via proveedor (SendGrid, SES, etc.)
8. **Sistema registra** log con resultado

### Flujo: Recordatorios Programados
1. **Tarea cron** se ejecuta diariamente
2. **Sistema busca** asesorías en próximas 24h
3. **Para cada asesoría** no cancelada:
4. **Verifica** si ya se envió recordatorio
5. **Consulta** preferencias de usuarios involucrados
6. **Envía recordatorios** si están habilitados
7. **Marca** recordatorio como enviado

---

## 🛠️ Consideraciones Técnicas

### Proveedor de Email
```typescript
// Usar servicio como SendGrid, AWS SES, o Nodemailer
@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    // Implementación con proveedor elegido
  }
  
  async sendBulkEmail(recipients: EmailRecipient[]) {
    // Para recordatorios masivos
  }
}
```

### Queue de Emails
```typescript
// Usar Bull Queue o similar para emails asíncronos
@Processor('email')
export class EmailProcessor {
  @Process('send-notification')
  async handleSendNotification(job: Job<EmailJob>) {
    await this.emailService.sendEmail(job.data);
  }
}
```

### Rate Limiting
- Limitar emails por usuario por hora
- Queue para evitar spam al proveedor
- Backoff exponencial para reintentos

---

## 🎯 Criterios de Completitud
- [ ] Sistema de plantillas configurable implementado
- [ ] Notificaciones para todos los eventos críticos
- [ ] Preferencias de usuario funcionales
- [ ] Cron jobs para recordatorios automáticos
- [ ] Logs y monitoreo de entregas
- [ ] Queue system para manejo asíncrono
- [ ] Tests para lógica de notificaciones
- [ ] Documentación de variables de plantillas