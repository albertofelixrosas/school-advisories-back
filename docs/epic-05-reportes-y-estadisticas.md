# Epic 5: Reportes y Estadísticas

## 📋 Descripción
Sistema de reportes y analíticas para administradores, profesores y estudiantes para analizar uso, desempeño y métricas de las asesorías.

## 👥 Roles Involucrados
- **Administrador**: Acceso completo a todos los reportes y métricas globales
- **Profesor**: Reportes de sus propias asesorías y estudiantes
- **Estudiante**: Histórico personal de asesorías recibidas

---

## 📖 Historias de Usuario

### US-018: Admin ve dashboard con métricas generales
**Como** administrador  
**Quiero** ver un dashboard con métricas clave del sistema  
**Para** monitorear la adopción y uso de las asesorías

#### Criterios de Aceptación
✅ Veo métricas del mes actual y comparativo con mes anterior  
✅ Métricas incluyen: total asesorías, tasa de asistencia, profesores activos  
✅ Gráficos de tendencias por semana/mes  
✅ Top 5 materias con más asesorías  
✅ Top 5 profesores con más asesorías impartidas  
✅ Tasa de aprovación/rechazo de solicitudes  
✅ Tiempo promedio de respuesta a solicitudes

#### Endpoints Sugeridos
```http
GET /reports/dashboard                   # Métricas generales del dashboard
GET /reports/trends?period=month        # Tendencias por período
GET /reports/top-subjects               # Materias más populares
GET /reports/top-professors             # Profesores más activos
```

#### Métricas Clave
- **Asesorías completadas**: Total del período
- **Tasa de asistencia**: % de estudiantes que asistieron vs registrados
- **Solicitudes pendientes**: Cantidad actual
- **Tiempo promedio de respuesta**: Horas entre solicitud y respuesta del profesor
- **Utilización por venue**: Distribución presencial vs virtual

---

### US-019: Reportes de asesorías por profesor
**Como** administrador  
**Quiero** generar reportes detallados por profesor  
**Para** evaluar desempeño y carga de trabajo de cada profesor

#### Criterios de Aceptación
✅ Filtro por profesor, materia, rango de fechas  
✅ Métricas incluyen: asesorías impartidas, estudiantes atendidos únicos, horas totales  
✅ Desglose por materia que imparte  
✅ Tasa de asistencia a sus asesorías  
✅ Tiempo promedio de sesión  
✅ Temas más consultados (análisis de texto libre)  
✅ Exportar a Excel/PDF

#### Endpoints Sugeridos
```http
GET /reports/professors/:id             # Reporte de un profesor específico
GET /reports/professors                 # Reporte comparativo de todos los profesores
GET /reports/professors/:id/export      # Exportar reporte a Excel/PDF
```

#### Datos del Reporte
```typescript
interface ProfessorReport {
  professor: User;
  period: { startDate: Date; endDate: Date };
  totalSessions: number;
  completedSessions: number;
  totalStudentsAttended: number;
  uniqueStudentsHelped: number;
  averageAttendanceRate: number;
  totalHours: number;
  subjectBreakdown: {
    subject: Subject;
    sessions: number;
    attendanceRate: number;
  }[];
  topTopics: string[];
  monthlyTrend: { month: string; sessions: number }[];
}
```

---

### US-020: Reportes de asesorías por materia
**Como** administrador  
**Quiero** ver reportes de uso por materia  
**Para** identificar materias con alta demanda y necesidades de profesores adicionales

#### Criterios de Aceptación
✅ Listado de materias ordenado por cantidad de asesorías  
✅ Para cada materia: profesores asignados, asesorías impartidas, estudiantes únicos  
✅ Tasa de ocupación por materia (solicitudes vs capacidad)  
✅ Materias con mayor tiempo de espera para asesorías  
✅ Comparativo entre períodos académicos  
✅ Gráfico de distribución de asesorías por materia

#### Endpoints Sugeridos
```http
GET /reports/subjects                   # Reporte general por materias
GET /reports/subjects/:id               # Reporte detallado de una materia
GET /reports/subjects/comparison        # Comparativo entre períodos
```

---

### US-021: Profesor ve sus estadísticas personales
**Como** profesor  
**Quiero** ver mis estadísticas de asesorías impartidas  
**Para** hacer seguimiento de mi actividad y desempeño

#### Criterios de Aceptación
✅ Veo mis métricas del semestre/año actual  
✅ Desglose por materia que imparto  
✅ Estudiantes únicos que he asesorado  
✅ Temas más consultados en mis asesorías  
✅ Promedio de estudiantes por sesión  
✅ Mi ranking vs otros profesores (opcional)  
✅ Gráfico de actividad semanal/mensual

#### Endpoints Sugeridos
```http
GET /professors/me/stats                # Mis estadísticas personales
GET /professors/me/activity-trend       # Tendencia de mi actividad
GET /professors/me/students-helped      # Estudiantes que he asesorado
```

---

### US-022: Estudiante ve su histórico de asesorías
**Como** estudiante  
**Quiero** ver mi histórico de asesorías recibidas  
**Para** hacer seguimiento de mi progreso y materias consultadas

#### Criterios de Aceptación
✅ Veo todas mis asesorías pasadas y próximas  
✅ Filtro por materia, profesor, fecha  
✅ Para cada asesoría veo: fecha, profesor, materia, tema, notas  
✅ Conteo total de asesorías por materia  
✅ Profesores con los que más he trabajado  
✅ Temas que más he consultado  
✅ Descargar histórico en PDF

#### Endpoints Sugeridos
```http
GET /students/me/advisory-history       # Mi histórico completo
GET /students/me/stats                  # Mis estadísticas personales
GET /students/me/export-history         # Exportar histórico
```

---

### US-023: Reportes de asistencia y no-shows
**Como** administrador  
**Quiero** reportes de asistencia y ausentismo  
**Para** identificar patrones y tomar acciones correctivas

#### Criterios de Aceptación
✅ Tasa de asistencia general y por período  
✅ Estudiantes con mayor ausentismo  
✅ Profesores con mejor tasa de asistencia en sus sesiones  
✅ Horarios/días con mayor ausentismo  
✅ Comparativo presencial vs virtual  
✅ Tendencias de asistencia por materia

#### Endpoints Sugeridos
```http
GET /reports/attendance/overview        # Vista general de asistencia
GET /reports/attendance/no-shows        # Estudiantes con ausentismo alto
GET /reports/attendance/by-schedule     # Asistencia por horarios
```

---

### US-024: Exportación de reportes
**Como** administrador o profesor  
**Quiero** exportar reportes en diferentes formatos  
**Para** compartir información y hacer análisis externos

#### Criterios de Aceptación
✅ Exportar a Excel (.xlsx) con múltiples hojas si es necesario  
✅ Exportar a PDF con formato profesional y gráficos  
✅ Exportar datos raw en CSV para análisis externos  
✅ Incluir filtros aplicados en el encabezado del reporte  
✅ Logo y datos de la institución en reportes PDF  
✅ Programar envío automático de reportes por email (opcional)

#### Endpoints Sugeridos
```http
GET /reports/:reportId/export?format=xlsx
GET /reports/:reportId/export?format=pdf
GET /reports/:reportId/export?format=csv
POST /reports/:reportId/schedule-email   # Programar envío automático
```

---

## 🔄 Flujos de Proceso

### Flujo: Generación de Reporte Dashboard
1. **Admin accede** a sección de reportes
2. **Selecciona período** (mes actual por defecto)
3. **Sistema consulta** métricas agregadas de la BD
4. **Sistema calcula** KPIs y tendencias
5. **Sistema genera** gráficos y tablas
6. **Muestra dashboard** con opción de exportar

### Flujo: Reporte Detallado con Filtros
1. **Usuario selecciona** tipo de reporte (profesor/materia/asistencia)
2. **Aplica filtros** (fechas, profesor, materia, etc.)
3. **Sistema valida** permisos según rol del usuario
4. **Sistema consulta** datos filtrados
5. **Sistema genera** reporte con métricas calculadas
6. **Usuario puede** exportar o programar envío

---

## 📊 Métricas y KPIs Principales

### Métricas de Adopción
- **Usuarios activos**: Profesores y estudiantes que usan el sistema mensualmente
- **Asesorías por estudiante**: Promedio de asesorías solicitadas por estudiante
- **Tasa de retención**: % de estudiantes que solicitan segunda asesoría

### Métricas de Eficiencia
- **Tiempo de respuesta**: Horas promedio entre solicitud y respuesta
- **Tasa de aprovación**: % de solicitudes aprobadas vs rechazadas
- **Utilización de horarios**: % de slots disponibles que se ocupan

### Métricas de Calidad
- **Tasa de asistencia**: % de estudiantes que asisten vs no-shows
- **Sesiones completadas**: % de sesiones que se marcan como completadas
- **Satisfacción** (si se implementa rating): Promedio de calificaciones

---

## 🎨 Consideraciones de UI/UX
- **Dashboard visual**: Gráficos interactivos con Chart.js o similar
- **Filtros intuitivos**: DatePickers, selects con búsqueda
- **Exportación fácil**: Botones prominentes para descargar
- **Carga progresiva**: Skeleton loaders para reportes que toman tiempo
- **Responsive**: Reportes visibles en móvil con tablas horizontales

---

## 🔍 Queries Complejas Requeridas

```sql
-- Tasa de asistencia por profesor
SELECT 
  u.name as professor_name,
  COUNT(aa.id) as total_attendances,
  COUNT(CASE WHEN aa.attended = true THEN 1 END) as attended_count,
  ROUND(
    COUNT(CASE WHEN aa.attended = true THEN 1 END) * 100.0 / COUNT(aa.id), 
    2
  ) as attendance_rate
FROM users u
JOIN advisory_dates ad ON ad.created_by = u.id
JOIN advisory_attendances aa ON aa.advisory_date_id = ad.id
WHERE u.role = 'PROFESSOR'
  AND ad.date >= '2024-01-01'
GROUP BY u.id, u.name
ORDER BY attendance_rate DESC;

-- Top materias por demanda
SELECT 
  s.name as subject_name,
  COUNT(DISTINCT ad.id) as total_sessions,
  COUNT(DISTINCT aa.student_id) as unique_students,
  AVG(session_duration) as avg_duration
FROM subjects s
JOIN subject_details sd ON sd.subject_id = s.id
JOIN advisory_dates ad ON ad.subject_detail_id = sd.id
JOIN advisory_attendances aa ON aa.advisory_date_id = ad.id
WHERE ad.date >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY s.id, s.name
ORDER BY total_sessions DESC
LIMIT 10;
```

---

## 🎯 Criterios de Completitud
- [ ] Dashboard con métricas principales implementado
- [ ] Reportes por profesor, materia y asistencia
- [ ] Exportación a Excel, PDF y CSV
- [ ] Vistas personalizadas por rol
- [ ] Queries optimizadas para reportes grandes
- [ ] Sistema de caché para reportes frecuentes
- [ ] Tests para cálculos de métricas críticas