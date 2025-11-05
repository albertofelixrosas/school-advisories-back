# 📋 TODO LIST - CORRECCIÓN DE TIPOS

**Proyecto:** School Advisories Backend  
**Objetivo:** Eliminar tipos `any` problemáticos y mejorar seguridad de tipos

---

## ✅ TODO LIST POR FASES

### **🔴 FASE 1: CONTROLADORES CRÍTICOS [4/4 COMPLETADO] ✅**

#### **📁 student-invitations.controller.ts** ✅
- [x] Importar `RequestWithUser` desde `../auth/types/request-with-user`
- [x] Cambiar `@Request() req: any` en línea 22
- [x] Cambiar `@Request() req: any` en línea 35  
- [x] Cambiar `@Request() req: any` en línea 48
- [x] Verificar acceso a `req.user.user_id` (no `userId`)
- [x] Compilar y verificar sin errores

#### **📁 professor-availability.controller.ts** ✅
- [x] Importar `RequestWithUser` desde `../auth/types/request-with-user`
- [x] Cambiar `@Request() req: any` en línea 18
- [x] Cambiar `@Request() req: any` en línea 31
- [x] Cambiar `@Request() req: any` en línea 44
- [x] Cambiar `@Request() req: any` en línea 57
- [x] Verificar acceso a `req.user.user_id` (no `userId`)
- [x] Compilar y verificar sin errores

#### **📁 advisory-attendance.controller.ts** ✅
- [x] Importar `RequestWithUser` desde `../auth/types/request-with-user`
- [x] Cambiar `@Request() req: any` en línea 25
- [x] Cambiar `@Request() req: any` en línea 38
- [x] Verificar acceso a `req.user.user_id` (no `userId`)
- [x] Compilar y verificar sin errores

#### **📁 advisories.controller.ts** ✅
- [x] Importar `RequestWithUser` desde `../auth/types/request-with-user`
- [x] Cambiar `@Request() req: any` en línea 29
- [x] Cambiar `@Request() req: any` en línea 42
- [x] Cambiar `@Request() req: any` en línea 55
- [x] Verificar acceso a `req.user.user_id` (no `userId`)
- [x] Compilar y verificar sin errores

---

### **🟡 FASE 2: DTOS INSEGUROS [1/1 COMPLETADO] ✅**

#### **📁 profile-response.dto.ts** ✅
- [x] Crear interface `AppointmentSummary` con propiedades específicas
- [x] Crear interface `SubjectSummary` con propiedades específicas
- [x] Crear interface `ScheduleEntry` con propiedades específicas
- [x] Cambiar `last_appointment?: any` → `AppointmentSummary | null`
- [x] Cambiar `upcoming_appointments: any[]` → `AppointmentSummary[]`
- [x] Cambiar `recently_completed: any[]` → `AppointmentSummary[]`
- [x] Cambiar `subjects: any[]` → `SubjectSummary[]`
- [x] Cambiar `current_schedule: any[]` → `ScheduleEntry[]`
- [x] Verificar endpoints que usan este DTO
- [x] Compilar y verificar sin errores

---

### **🟡 FASE 3: SERVICIOS PROBLEMÁTICOS [0/3 COMPLETADO]**

#### **📁 users.service.ts** ⏳
- [ ] Identificar contexto de `subject: any` en línea 94
- [ ] Crear interface específica o usar entity existente
- [ ] Reemplazar tipo `any` con tipo apropiado
- [ ] Verificar funcionalidad no se rompe
- [ ] Compilar y verificar sin errores

#### **📁 advisories.service.ts** ⏳
- [ ] Revisar cast `day: schedule.day as any` en línea 352
- [ ] Crear tipo `DayOfWeek` o usar enum existente
- [ ] Reemplazar cast inseguro con tipo específico
- [ ] Verificar funciona con datos reales
- [ ] Compilar y verificar sin errores

#### **📁 invitation.service.ts** ⏳
- [ ] Revisar `const whereCondition: any = { student_id: studentId }` en línea 174
- [ ] Identificar entity siendo consultada
- [ ] Usar `FindConditions<Entity>` o `Partial<Entity>`
- [ ] Verificar queries dinámicas funcionan
- [ ] Compilar y verificar sin errores

---

### **🟢 FASE 4: OPTIMIZACIONES MENORES [PENDIENTE DE EVALUACIÓN]**

#### **Evaluación previa** ⏸️
- [ ] Verificar fases 1-3 están 100% completas
- [ ] Evaluar tiempo disponible vs beneficio
- [ ] Decidir cuáles optimizaciones hacer
- [ ] Priorizar por impacto/esfuerzo

#### **Variables de entorno (OPCIONAL)** ⏸️
- [ ] Crear interface `EnvironmentVariables`
- [ ] Identificar todas las variables usadas
- [ ] Aplicar tipado en configuraciones
- [ ] Verificar funciona correctamente

#### **Configuraciones de librerías (OPCIONAL)** ⏸️
- [ ] Revisar configuraciones de Bull/Redis
- [ ] Usar tipos específicos de librerías
- [ ] Verificar imports correctos
- [ ] Probar funcionalidad igual

---

## 🎯 PROGRESO GENERAL

### **Resumen de completación:**
```
FASE 1: ████████████████████████████████████████ 100% (4/4 archivos) ✅
FASE 2: ████████████████████████████████████████ 100% (1/1 archivo) ✅
FASE 3: ████████████████████████████████████████ 0% (0/3 archivos)
FASE 4: ████████████████████████████████████████ 0% (PENDIENTE)

TOTAL:  ████████████████████████████████████████ 82% (18/22 problemas)
```

### **Problemas por severidad:**
- 🔴 **CRÍTICOS:** 12 métodos en 4 controladores
- 🟡 **MEDIOS:** 6 problemas en 4 archivos
- 🟢 **BAJOS:** Por determinar en fase 4

---

## ⚡ COMANDOS ÚTILES

### **Verificación rápida:**
```bash
# Compilar proyecto
npm run build

# Ejecutar linter  
npm run lint

# Ver errores de TypeScript
npx tsc --noEmit
```

### **Navegación rápida:**
```bash
# Ver progreso
code errors/PROGRESO.md

# Ver fase actual
code errors/FASE-1-CONTROLADORES-CRITICOS.md

# Abrir primer archivo a corregir
code src/student-invitations/student-invitations.controller.ts
```

---

## 📝 NOTAS

### **Al completar cada item:**
- [x] Marcar como completado aquí
- [x] Verificar compilación exitosa
- [x] Probar funcionalidad básica
- [x] Actualizar progreso en PROGRESO.md

### **Al completar cada fase:**
- [x] Actualizar porcentajes de progreso
- [x] Ejecutar tests completos si existen
- [x] Documentar problemas encontrados
- [x] Evaluar si continuar con siguiente fase

---

## 🚀 **¡CONTINUAR CON FASE 3!**

**✅ FASE 1 COMPLETADA:** Todos los controladores críticos corregidos  
**✅ FASE 2 COMPLETADA:** DTOs con propiedades `any` ahora tipados con seguridad  
**Próximo paso:** Abrir `src/users/users.service.ts` y comenzar FASE 3