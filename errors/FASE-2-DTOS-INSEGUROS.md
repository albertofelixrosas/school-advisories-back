# 🟡 FASE 2: DTOS CON TIPOS INSEGUROS

**Prioridad:** MEDIA  
**Impacto:** Mejora la robustez y validación de datos  
**Tiempo estimado:** 1-2 horas

---

## 🚨 **PROBLEMA IDENTIFICADO**

El archivo `src/auth/dto/profile-response.dto.ts` contiene múltiples propiedades con tipo `any`, lo que elimina la validación de tipos y puede causar problemas en el intercambio de datos entre frontend y backend.

---

## 📋 **ARCHIVO A CORREGIR**

### **✅ CHECKLIST PRINCIPAL:**

#### **📁 `src/auth/dto/profile-response.dto.ts`**
- [ ] **Problema:** Múltiples propiedades con tipo `any`
- [ ] **Propiedades afectadas:** 5 propiedades críticas
- [ ] **Impacto:** Pérdida de validación en responses de API
- [ ] **Corrección:** Crear interfaces específicas para cada tipo de dato

---

## 🔍 **PROPIEDADES PROBLEMÁTICAS IDENTIFICADAS**

```typescript
// ❌ PROBLEMÁTICO: Tipos any encontrados
export class ProfileResponseDto {
  // ... propiedades normales ...
  
  last_appointment?: any;           // ← Problema 1
  upcoming_appointments: any[];     // ← Problema 2  
  recently_completed: any[];        // ← Problema 3
  subjects: any[];                  // ← Problema 4
  current_schedule: any[];          // ← Problema 5
}
```

---

## 🔧 **PLAN DE CORRECCIÓN DETALLADO**

### **PASO 1: Crear interfaces específicas**

#### **1.1 Interface para Appointment**
```typescript
interface AppointmentSummary {
  appointment_id: number;
  advisory_date_id: number;
  subject_name: string;
  professor_name?: string;
  student_name?: string;
  scheduled_date: Date;
  start_time: string;
  end_time: string;
  status: string;
  location?: string;
}
```

#### **1.2 Interface para Subject**
```typescript
interface SubjectSummary {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  professor_id?: number;
  professor_name?: string;
  total_advisories?: number;
  pending_requests?: number;
}
```

#### **1.3 Interface para Schedule**
```typescript
interface ScheduleEntry {
  schedule_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_name?: string;
  location?: string;
  is_available: boolean;
}
```

### **PASO 2: Actualizar ProfileResponseDto**
```typescript
// ✅ CORRECCIÓN: Tipos específicos
export class ProfileResponseDto {
  user_id: number;
  username: string;
  email: string;
  name: string;
  last_name: string;
  phone_number: string;
  role: UserRole;
  photo_url?: string;
  last_login_at?: Date;
  
  // Propiedades corregidas con tipos específicos
  last_appointment?: AppointmentSummary;
  upcoming_appointments: AppointmentSummary[];
  recently_completed: AppointmentSummary[];
  subjects: SubjectSummary[];
  current_schedule: ScheduleEntry[];
}
```

---

## 📝 **CHECKLIST DE IMPLEMENTACIÓN**

### **✅ Interfaces a crear:**
- [ ] **AppointmentSummary** - Para last_appointment y arrays de appointments
- [ ] **SubjectSummary** - Para array de subjects
- [ ] **ScheduleEntry** - Para current_schedule

### **✅ Propiedades a corregir:**
- [ ] **last_appointment** - `any` → `AppointmentSummary | undefined`
- [ ] **upcoming_appointments** - `any[]` → `AppointmentSummary[]`
- [ ] **recently_completed** - `any[]` → `AppointmentSummary[]`
- [ ] **subjects** - `any[]` → `SubjectSummary[]`
- [ ] **current_schedule** - `any[]` → `ScheduleEntry[]`

### **✅ Validaciones a realizar:**
- [ ] **Compilación exitosa** sin errores de TypeScript
- [ ] **IntelliSense funcional** para todas las propiedades
- [ ] **Validación de estructura** en responses de API
- [ ] **Compatibilidad** con código existente que usa este DTO

---

## 🔧 **ARCHIVOS RELACIONADOS A REVISAR**

Después de corregir el DTO, verificar que los siguientes archivos no tengan problemas:

### **Servicios que usan ProfileResponseDto:**
- [ ] `src/auth/auth.service.ts` - Método `getProfile()`
- [ ] `src/auth/auth.controller.ts` - Endpoint `/auth/profile`
- [ ] `src/users/users.service.ts` - Si construye profiles

### **Posibles impactos:**
- [ ] Verificar que los datos retornados coincidan con las nuevas interfaces
- [ ] Ajustar queries si es necesario para obtener campos específicos
- [ ] Asegurar que no hay campos faltantes en las responses

---

## ⚠️ **CONSIDERACIONES ESPECIALES**

### **1. Retrocompatibilidad**
- Las interfaces deben ser **compatibles** con datos existentes
- Usar propiedades **opcionales** (`?`) cuando sea necesario
- No romper contratos de API existentes

### **2. Validación de datos**
- Considerar agregar **validaciones adicionales** con class-validator
- Asegurar que los datos del backend coincidan con las interfaces

### **3. Documentación**
- Actualizar **documentación de API** si existe
- Agregar **comentarios JSDoc** a las nuevas interfaces

---

## 🎯 **RESULTADO ESPERADO**

### **Después de completar FASE 2:**
- ✅ **Eliminación completa** de tipos `any` en DTOs
- ✅ **Validación automática** de estructuras de datos
- ✅ **IntelliSense completo** para propiedades de response
- ✅ **Mejor documentación** automática de APIs
- ✅ **Detección temprana** de errores de estructura de datos

### **Métricas de progreso:**
- **DTOs corregidos:** 0/1
- **Propiedades con `any` eliminadas:** 0/5
- **Interfaces nuevas creadas:** 0/3

---

## 📋 **ORDEN DE EJECUCIÓN**

1. **PASO 1:** Crear las 3 interfaces nuevas
2. **PASO 2:** Actualizar ProfileResponseDto
3. **PASO 3:** Verificar compilación
4. **PASO 4:** Probar endpoints de auth/profile
5. **PASO 5:** Ajustar servicios si es necesario

---

## 📝 **NOTAS DE IMPLEMENTACIÓN**

- **Mantener** nombres de propiedades existentes
- **Usar** convención snake_case del backend
- **Considerar** hacer interfaces **exportables** para uso en otros módulos
- **Documentar** cualquier cambio en estructura de datos