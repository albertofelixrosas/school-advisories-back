# Epic 5: Reportes y Estadísticas

**🏆 Prioridad: BAJA** | **Complejidad: Media** | **Sprint: 4**

---

## 📝 **Descripción de la Épica**

Como administrador, necesito generar reportes y visualizar estadísticas sobre el uso del sistema de asesorías para tomar decisiones informadas sobre recursos, identificar tendencias y evaluar el desempeño del programa de asesorías.

**Valor de Negocio**: Toma de decisiones basada en datos, optimización de recursos y evaluación de impacto del programa de asesorías.

---

## 🎯 **Historias de Usuario**

### **US-017: Reportes de asesorías por profesor**

```gherkin
Como administrador
Quiero generar reportes detallados de asesorías por profesor
Para evaluar la carga de trabajo y efectividad de cada docente

Given soy un administrador autenticado
When navego a "Reportes" → "Por Profesor"
Then veo formulario de filtros:
  - Profesor: [multiselect, all selected por defecto]
  - Materias: [multiselect de todas las materias]
  - Rango de fechas: [date pickers, default: último mes]
  - Estado de sesiones: [multiselect: Completadas, Canceladas, Todas]
  - Tipo de reporte: [radio] Resumen / Detallado

When selecciono filtros y hago clic en "Generar Reporte"
Then veo dashboard con:

Métricas por Profesor:
  - Total de asesorías impartidas
  - Promedio de estudiantes por sesión
  - Tasa de asistencia (estudiantes que asistieron / inscritos)
  - Tasa de cancelación (por profesor vs por estudiantes)
  - Materias más solicitadas
  - Horarios más activos

Gráficos:
  - Asesorías por mes (línea temporal)
  - Distribución por materia (pie chart)
  - Comparativa entre profesores (bar chart)
  - Heatmap de horarios de asesorías

When selecciono "Tipo: Detallado"
Then veo además tabla con cada sesión individual:
  - Fecha, materia, tema, estudiantes, asistencia, duración, venue
```

**Criterios de Aceptación**:
- ✅ Filtros funcionan correctamente y son persistentes
- ✅ Métricas son precisas y actualizadas en tiempo real
- ✅ Gráficos son interactivos y responsivos
- ✅ Puedo exportar reportes a PDF y Excel
- ✅ Vista detallada permite drill-down a sesiones específicas
- ✅ Comparativas entre profesores son justas (consideran tiempo de asignación)

**Endpoints**:
```http
GET /api/admin/reports/professors
Query params: ?professorIds=1,2,3&subjectIds=1,2&startDate=2025-01-01&endDate=2025-12-31&status=COMPLETED&type=summary
Response: {
  "summary": {
    "totalSessions": 150,
    "avgStudentsPerSession": 2.3,
    "overallAttendanceRate": 87.5
  },
  "professorStats": [{
    "professor": {"name": "Dr. García"},
    "metrics": {
      "totalSessions": 45,
      "studentsHelped": 89,
      "attendanceRate": 92.1,
      "cancellationRate": 8.2,
      "avgDuration": 52 // minutos
    },
    "topSubjects": [
      {"subject": "Cálculo", "sessions": 30},
      {"subject": "Álgebra", "sessions": 15}
    ]
  }],
  "timeDistribution": [
    {"month": "2025-01", "sessions": 25},
    {"month": "2025-02", "sessions": 35}
  ]
}

GET /api/admin/reports/professors/detailed
# Mismos query params, retorna array de sesiones individuales

POST /api/admin/reports/export
Body: {
  "reportType": "PROFESSOR_SUMMARY",
  "filters": {...},
  "format": "PDF|EXCEL"
}
Response: { "downloadUrl": "signed-url-to-file" }
```

---

### **US-018: Reportes de asesorías por estudiante**

```gherkin
Como administrador
Quiero generar reportes de asesorías por estudiante  
Para identificar estudiantes que necesitan más apoyo o que usan mucho el servicio

Given soy un administrador autenticado
When navego a "Reportes" → "Por Estudiante"
Then veo formulario similar al de profesores pero orientado a estudiantes:
  - Estudiante: [searchable select con autocompletado]
  - Carrera/Programa: [multiselect]
  - Semestre: [multiselect] 
  - Rango de fechas: [date pickers]
  - Incluir: [checkboxes] Sesiones asistidas / Canceladas / Solicitudes rechazadas

When genero reporte
Then veo métricas por estudiante:
  - Total de asesorías solicitadas vs asistidas
  - Materias con más asesorías requeridas
  - Profesores más consultados
  - Temas más consultados (nube de palabras)
  - Patrón temporal de solicitudes
  - Tasa de "no show" (inscrito pero no asistió)

Alertas Automáticas:
  - Estudiantes con alta tasa de cancelación (>30%)
  - Estudiantes con muchas asesorías en una materia (posible riesgo académico)
  - Estudiantes que no han usado el servicio (potencial alcance)

When hago clic en un estudiante específico  
Then veo su perfil detallado:
  - Historial completo de asesorías
  - Timeline de actividad
  - Análisis de patrones (horarios preferidos, materias críticas)
```

**Criterios de Aceptación**:
- ✅ Respeta privacidad: solo admins ven datos personales de estudiantes
- ✅ Alertas automáticas destacan casos que requieren atención
- ✅ Nube de palabras se genera automáticamente de temas de asesorías
- ✅ Filtros por carrera y semestre funcionan correctamente
- ✅ Drill-down a estudiante individual muestra historial completo
- ✅ Identificación de patrones de riesgo académico

**Endpoints**:
```http
GET /api/admin/reports/students  
Query params: ?studentIds=100,101&programs=ING_SISTEMAS&semester=2025-1&startDate=2025-01-01
Response: {
  "studentStats": [{
    "student": {"name": "Juan Pérez", "program": "Ing. Sistemas"},
    "metrics": {
      "sessionsRequested": 12,
      "sessionsAttended": 10,
      "attendanceRate": 83.3,
      "noShowRate": 16.7,
      "topSubjects": [{"subject": "Cálculo", "count": 7}],
      "riskLevel": "MEDIUM" // LOW, MEDIUM, HIGH
    }
  }],
  "alerts": [{
    "type": "HIGH_CANCELLATION_RATE",
    "student": {"name": "María López"},
    "description": "45% cancellation rate in last month"
  }]
}

GET /api/admin/reports/students/:id/profile
Response: {
  "student": {...},
  "timeline": [{
    "date": "2025-10-15",
    "type": "SESSION_ATTENDED",
    "subject": "Cálculo",
    "professor": "Dr. García"
  }],
  "patterns": {
    "preferredHours": ["14:00-16:00", "16:00-18:00"],
    "criticalSubjects": ["Cálculo", "Física"],
    "frequentTopics": ["Derivadas", "Integrales"]
  }
}
```

---

### **US-019: Dashboard ejecutivo y KPIs**

```gherkin
Como administrador
Quiero ver un dashboard ejecutivo con KPIs principales del sistema
Para tener una vista rápida del estado y tendencias del programa de asesorías

Given soy un administrador autenticado  
When navego a "Dashboard" (página principal después del login)
Then veo dashboard con métricas en tiempo real:

KPIs Principales (tarjetas):
  - Total asesorías este mes vs mes anterior
  - Tasa de aprobación de solicitudes (% aprobadas/rechazadas)
  - Estudiantes únicos atendidos este mes
  - Promedio de tiempo de respuesta de profesores
  - Venues más utilizados
  - Horarios pico de asesorías

Gráficos en el Dashboard:
  - Tendencia mensual de asesorías (12 meses)
  - Top 5 materias más solicitadas
  - Distribución de asesorías por venue type (virtual vs presencial)
  - Profesores más activos (top 10)

Alertas y Notificaciones:
  - Solicitudes pendientes hace más de 48h
  - Profesores inactivos (sin asesorías en 30 días)
  - Picos inusuales de demanda
  - Venues con alta demanda vs capacidad

Acciones Rápidas:
  - [Ver Solicitudes Pendientes]
  - [Generar Reporte Mensual]
  - [Gestionar Usuarios]
  - [Configurar Alertas]
```

**Criterios de Aceptación**:
- ✅ Dashboard se carga en menos de 3 segundos
- ✅ Datos se actualizan automáticamente cada 5 minutos
- ✅ Todas las métricas son precisas y verificables
- ✅ Gráficos son interactivos (zoom, filtros temporales)
- ✅ Alertas son accionables (con enlaces directos)
- ✅ Vista es responsive para diferentes tamaños de pantalla

**Endpoints**:
```http
GET /api/admin/dashboard/kpis
Response: {
  "currentMonth": {
    "totalSessions": 245,
    "approvalRate": 87.3,
    "uniqueStudents": 156,
    "avgResponseTime": "4.2 hours"
  },
  "trends": {
    "sessionsGrowth": "+12.5%", // vs mes anterior
    "studentsGrowth": "+8.1%"
  },
  "alerts": [{
    "type": "PENDING_REQUESTS",
    "count": 5,
    "description": "5 requests pending >48h",
    "actionUrl": "/admin/requests/pending"
  }]
}

GET /api/admin/dashboard/charts/:chartType
Params: chartType = "monthly-trend"|"top-subjects"|"venue-distribution"|"active-professors"
Response: { "data": [...], "labels": [...] }

GET /api/admin/dashboard/notifications
Response: [{
  "id": 1,
  "type": "INFO|WARNING|ERROR",
  "message": "Dr. García has 3 pending requests",
  "timestamp": "ISO date",
  "actionRequired": true,
  "actionUrl": "/admin/professors/5/requests"
}]
```

---

## 🔧 **Cambios Técnicos Requeridos**

### **Nueva entidad: ReportCache**:
```typescript
@Entity()
export class ReportCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reportType: string; // "PROFESSOR_SUMMARY", "STUDENT_ANALYSIS", etc.

  @Column()
  filterHash: string; // hash de los parámetros para cache key

  @Column('json')
  data: any; // resultado del reporte cacheado

  @Column()
  generatedAt: Date;

  @Column({ default: 3600 }) // 1 hora
  ttlSeconds: number;

  @ManyToOne(() => User)
  generatedBy: User;
}
```

### **Vistas de Base de Datos para Performance**:
```sql
-- Vista materializada para estadísticas de profesores
CREATE MATERIALIZED VIEW professor_stats AS
SELECT 
  p.id as professor_id,
  p.name as professor_name,
  COUNT(ad.id) as total_sessions,
  COUNT(DISTINCT aa.student_id) as unique_students,
  AVG(aa.attended::int) as attendance_rate,
  DATE_TRUNC('month', ad.date) as month
FROM users p
JOIN advisory_dates ad ON ad.professor_id = p.id
LEFT JOIN advisory_attendance aa ON aa.advisory_date_id = ad.id
WHERE p.role = 'PROFESSOR'
GROUP BY p.id, p.name, DATE_TRUNC('month', ad.date);

-- Índices para queries de reportes
CREATE INDEX idx_advisory_dates_professor_date ON advisory_dates(professor_id, date);
CREATE INDEX idx_advisory_attendance_date ON advisory_attendance(advisory_date_id, attended);
CREATE INDEX idx_advisory_requests_status_date ON advisory_requests(status, created_at);
```

### **Servicio de Background Jobs**:
```typescript
@Injectable()
export class ReportGenerationService {
  
  @Cron('0 */15 * * * *') // cada 15 minutos
  async refreshDashboardCache() {
    // Actualizar métricas del dashboard
  }

  @Cron('0 0 1 * * *') // diario a la 1 AM
  async generateDailyReports() {
    // Pre-generar reportes comunes
  }

  @Cron('0 0 0 * * 1') // semanal los lunes
  async cleanOldReportCache() {
    // Limpiar cache expirado
  }

  async generateCustomReport(filters: ReportFilters): Promise<ReportData> {
    const cacheKey = this.generateCacheKey(filters);
    const cached = await this.getCachedReport(cacheKey);
    
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }

    const report = await this.computeReport(filters);
    await this.cacheReport(cacheKey, report);
    return report;
  }
}
```

---

## 📊 **Dashboard UI Mockup**

```
┌─────────────────── Dashboard Ejecutivo ───────────────────┐
│                                                           │
│  📊 KPIs del Mes          🔔 Alertas (3)                  │
│                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │   245   │ │  87.3%  │ │   156   │ │  4.2h   │         │
│  │Asesorías│ │ Aprob.  │ │Estudian.│ │ Resp.   │         │
│  │  +12%   │ │  +3.2%  │ │  +8.1%  │ │  -0.5h  │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                           │
│  📈 Tendencia (12 meses)    📋 Top Materias              │
│  ┌─────────────────────┐    ┌──────────────────────┐     │
│  │     /\   /\         │    │ Cálculo        │ 45  │     │
│  │    /  \ /  \  /\    │    │ Álgebra        │ 32  │     │
│  │   /    V    \/  \   │    │ Física         │ 28  │     │
│  │  /            \  \  │    │ Química        │ 15  │     │
│  └─────────────────────┘    └──────────────────────┘     │
│                                                           │
│  ⚠️ Alertas Activas:                                      │
│  • 5 solicitudes pendientes >48h     [Ver Detalles]      │
│  • Dr. Smith inactivo 30 días        [Contactar]         │
│  • Pico demanda Aula 205             [Analizar]          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 📧 **Alertas Automáticas por Email**

### **Reporte Semanal Automático**
```
Asunto: 📊 Reporte Semanal - Sistema de Asesorías

Hola [Admin Name],

Resumen de la semana del [fecha inicio] al [fecha fin]:

📈 Métricas Clave:
• Asesorías completadas: 67 (+15% vs semana anterior)
• Estudiantes únicos atendidos: 45
• Tasa de aprobación: 89.2%
• Tiempo promedio de respuesta: 3.8 horas

🏆 Destacados:
• Profesor más activo: Dr. García (12 asesorías)
• Materia más solicitada: Cálculo Diferencial (28 sesiones)
• Mejor tasa de asistencia: Dr. López (96.4%)

⚠️ Puntos de Atención:
• 3 solicitudes pendientes >72h
• Venue "Aula 205" al 95% de capacidad
• 2 profesores sin actividad esta semana

Ver dashboard completo: [Enlace]

Sistema de Asesorías ITSON
```

---

## 🧪 **Casos de Prueba Críticos**

1. **Performance de reportes**: Generar reporte de 1000+ sesiones → Respuesta <5 segundos
2. **Cache de reportes**: Mismos filtros aplicados 2 veces → Segunda respuesta desde cache
3. **Exportación**: Generar Excel con 500 registros → Archivo descargable sin errores
4. **Dashboard en tiempo real**: Completar sesión → KPIs actualizados en 5 minutos
5. **Alertas automáticas**: Solicitud pendiente 48h → Aparece en alertas del dashboard
6. **Filtros complejos**: Combinar múltiples filtros → Resultados precisos y consistentes

---

*Última actualización: 31 de octubre de 2025*