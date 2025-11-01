# Epic 4: Gestión de Materias y Asignaciones

## 📋 Descripción
Sistema para administrar el catálogo de materias y asignar profesores a las materias que pueden impartir asesorías.

## 👥 Roles Involucrados
- **Administrador**: Gestiona materias y asignaciones
- **Profesor**: Ve sus materias asignadas
- **Estudiante**: Ve materias disponibles para solicitar asesorías

---

## 📖 Historias de Usuario

### US-013: Admin gestiona catálogo de materias
**Como** administrador  
**Quiero** crear, editar y eliminar materias del catálogo  
**Para** mantener actualizado el listado de materias disponibles en la institución

#### Criterios de Aceptación
✅ Puedo crear nueva materia con nombre único  
✅ Puedo editar nombre de materia existente  
✅ Puedo eliminar materia (solo si no tiene asignaciones activas)  
✅ Veo listado completo de materias con conteo de profesores asignados  
✅ Sistema valida unicidad del nombre de materia  
✅ Se registra auditoría de cambios (quién y cuándo)

#### Endpoints Sugeridos
```http
GET    /subjects                    # Listar todas las materias
POST   /subjects                    # Crear nueva materia
PUT    /subjects/:id                # Actualizar materia
DELETE /subjects/:id                # Eliminar materia
GET    /subjects/:id/assignments    # Ver asignaciones de una materia
```

#### Validaciones
- Nombre de materia: requerido, único, 3-100 caracteres
- No eliminar si tiene `SubjectDetails` activos
- Solo admin puede realizar estas operaciones

---

### US-014: Admin asigna profesores a materias
**Como** administrador  
**Quiero** asignar profesores a materias específicas  
**Para** controlar qué profesores pueden dar asesorías de cada materia

#### Criterios de Aceptación
✅ Puedo asignar un profesor a una o múltiples materias  
✅ Puedo asignar múltiples profesores a una materia  
✅ Veo listado de asignaciones profesor-materia existentes  
✅ Puedo remover asignación (solo si no hay asesorías activas)  
✅ Sistema previene asignaciones duplicadas  
✅ Se registra fecha de asignación y quién la creó

#### Endpoints Sugeridos
```http
POST   /subject-assignments                # Crear asignación
GET    /subject-assignments                # Listar todas las asignaciones
DELETE /subject-assignments/:id            # Remover asignación
GET    /professors/:id/subjects            # Materias de un profesor
GET    /subjects/:id/professors            # Profesores de una materia
```

#### Casos de Uso
1. **Asignación nueva**: Admin selecciona profesor y materia, sistema crea `SubjectDetails`
2. **Remoción**: Admin elimina asignación, sistema valida que no hay asesorías pendientes/activas
3. **Consulta**: Admin ve matriz profesor-materia para auditar asignaciones

---

### US-015: Profesor ve sus materias asignadas
**Como** profesor  
**Quiero** ver las materias que tengo asignadas  
**Para** saber de cuáles puedo crear asesorías y gestionar mi disponibilidad

#### Criterios de Aceptación
✅ Veo solo las materias que me han sido asignadas  
✅ Para cada materia veo: nombre, fecha de asignación  
✅ Veo conteo de asesorías impartidas por materia  
✅ Puedo filtrar/buscar por nombre de materia  
✅ Acceso desde perfil o sección "Mis Materias"

#### Endpoints Sugeridos
```http
GET /professors/me/subjects              # Mis materias asignadas
GET /professors/me/subjects/:id/stats    # Estadísticas de asesorías por materia
```

---

### US-016: Estudiante ve materias disponibles para asesoría
**Como** estudiante  
**Quiero** ver las materias en las que puedo solicitar asesoría  
**Para** identificar profesores disponibles y sus horarios

#### Criterios de Aceptación
✅ Veo solo materias en las que estoy matriculado  
✅ Para cada materia veo profesores asignados que dan asesorías  
✅ Veo disponibilidad de horarios por profesor-materia  
✅ Puedo filtrar por tipo de asesoría (presencial/virtual)  
✅ Veo próximas sesiones disponibles

#### Endpoints Sugeridos
```http
GET /students/me/available-subjects      # Materias donde puedo pedir asesoría
GET /subjects/:id/available-professors   # Profesores disponibles para asesoría
```

#### Notas Técnicas
- Requiere lógica para determinar materias del estudiante (posible tabla `StudentEnrollments`)
- Filtrar solo profesores con disponibilidad activa
- Mostrar próximos slots disponibles en horarios del profesor

---

### US-017: Validación de permisos para asesorías
**Como** sistema  
**Quiero** validar que solo profesores asignados puedan crear asesorías de una materia  
**Para** mantener integridad y control de acceso

#### Criterios de Aceptación
✅ Al crear asesoría, valido que profesor tenga `SubjectDetails` para esa materia  
✅ Al aprobar solicitud, valido permisos del profesor  
✅ API retorna 403 Forbidden si profesor no está asignado  
✅ Logs de auditoría registran intentos no autorizados

#### Implementación
```typescript
@Injectable()
export class SubjectAssignmentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Validar que el profesor tenga SubjectDetails para la materia
    // en el request body o params
  }
}
```

---

## 🔄 Flujos de Proceso

### Flujo: Asignación de Profesor a Materia
1. **Admin accede** a gestión de asignaciones
2. **Selecciona profesor** del listado de usuarios con rol PROFESSOR
3. **Selecciona materia** del catálogo
4. **Sistema valida** que no existe asignación duplicada
5. **Sistema crea** registro en `SubjectDetails`
6. **Sistema registra** auditoría (admin_id, timestamp)
7. **Notificación opcional** al profesor vía email

### Flujo: Eliminación de Asignación
1. **Admin selecciona** asignación a remover
2. **Sistema valida** que no hay asesorías activas/pendientes
3. **Si hay asesorías**: mostrar error con conteo
4. **Si no hay asesorías**: confirmar eliminación
5. **Sistema elimina** `SubjectDetails`
6. **Sistema registra** auditoría de eliminación

---

## 📊 Métricas y KPIs
- **Materias por profesor**: Promedio de materias asignadas por profesor
- **Profesores por materia**: Distribución de profesores por materia
- **Utilización**: % de asignaciones que generan asesorías activas
- **Cobertura**: % de materias con al menos un profesor asignado

---

## 🔍 Casos Edge y Validaciones
- **Materia sin profesores**: Permitir existir pero no mostrar en opciones de estudiante
- **Profesor sin materias**: Puede acceder al sistema pero no crear asesorías
- **Eliminación en cascada**: Al eliminar materia, eliminar `SubjectDetails` y validar asesorías
- **Cambio de rol**: Si usuario cambia de PROFESSOR a STUDENT, mantener `SubjectDetails` pero deshabilitar funcionalidades

---

## 🎯 Criterios de Completitud
- [ ] CRUD completo de materias con validaciones
- [ ] CRUD de asignaciones profesor-materia
- [ ] Validación de permisos en creación de asesorías  
- [ ] Vistas filtradas por rol (admin/profesor/estudiante)
- [ ] Auditoría de cambios en asignaciones
- [ ] Tests unitarios para validaciones de negocio