# 🔴 FASE 1: CONTROLADORES CRÍTICOS

**Prioridad:** MÁXIMA  
**Impacto:** Previene errores inmediatos en producción  
**Tiempo estimado:** 2-3 horas

---

## 🚨 **PROBLEMA IDENTIFICADO**

Los siguientes controladores usan `@Request() req: any` lo que elimina toda validación de tipos de TypeScript y puede causar **errores en tiempo de ejecución**.

### **💥 Error específico detectado:**
Varios archivos están accediendo a `req.user.userId` cuando la interfaz `UserPayload` define la propiedad como `req.user.user_id`.

---

## 📋 **ARCHIVOS A CORREGIR**

### **✅ CHECKLIST DE CONTROLADORES:**

#### **1. 📁 `src/student-invitations/student-invitations.controller.ts`**
- [ ] **Problema:** `@Request() req: any` (3 métodos afectados)
- [ ] **Líneas:** 22, 35, 48
- [ ] **Corrección:** Cambiar a `@Request() req: RequestWithUser`
- [ ] **Imports:** Agregar `RequestWithUser` desde auth/types
- [ ] **Propiedades:** Verificar acceso correcto a `req.user.user_id`

#### **2. 📁 `src/professor-availability/professor-availability.controller.ts`**
- [ ] **Problema:** `@Request() req: any` (4 métodos afectados)
- [ ] **Líneas:** 18, 31, 44, 57
- [ ] **Corrección:** Cambiar a `@Request() req: RequestWithUser`
- [ ] **Imports:** Agregar `RequestWithUser` desde auth/types
- [ ] **Propiedades:** Verificar acceso correcto a `req.user.user_id`

#### **3. 📁 `src/advisory-attendance/advisory-attendance.controller.ts`**
- [ ] **Problema:** `@Request() req: any` (2 métodos afectados)
- [ ] **Líneas:** 25, 38
- [ ] **Corrección:** Cambiar a `@Request() req: RequestWithUser`
- [ ] **Imports:** Agregar `RequestWithUser` desde auth/types
- [ ] **Propiedades:** Verificar acceso correcto a `req.user.user_id`

#### **4. 📁 `src/advisories/advisories.controller.ts`**
- [ ] **Problema:** `@Request() req: any` (3 métodos afectados)
- [ ] **Líneas:** 29, 42, 55
- [ ] **Corrección:** Cambiar a `@Request() req: RequestWithUser`
- [ ] **Imports:** Agregar `RequestWithUser` desde auth/types
- [ ] **Propiedades:** Verificar acceso correcto a `req.user.user_id`

---

## 🔧 **PASOS DE CORRECCIÓN POR ARCHIVO**

### **PASO 1: Verificar la interfaz RequestWithUser**
```typescript
// Verificar que existe en src/auth/types/request-with-user.ts
export interface RequestWithUser extends Request {
  user: {
    user_id: number;
    username: string;
    role: UserRole;
    // ... otras propiedades
  };
}
```

### **PASO 2: Patrón de corrección**
```typescript
// ❌ ANTES (Problemático)
@Get('example')
async exampleMethod(@Request() req: any) {
  const userId = req.user.userId; // ← ERROR: propiedad incorrecta
  // ...
}

// ✅ DESPUÉS (Correcto)  
import { RequestWithUser } from '../auth/types/request-with-user';

@Get('example')
async exampleMethod(@Request() req: RequestWithUser) {
  const userId = req.user.user_id; // ← CORRECTO: propiedad válida
  // ...
}
```

### **PASO 3: Imports necesarios**
Cada archivo necesitará:
```typescript
import { RequestWithUser } from '../auth/types/request-with-user';
// O ajustar la ruta según la ubicación del archivo
```

---

## ⚠️ **VALIDACIONES REQUERIDAS**

### **Para cada archivo:**
1. [ ] **Compilación exitosa** sin errores de TypeScript
2. [ ] **IntelliSense funcional** para `req.user.*`
3. [ ] **Acceso correcto** a `req.user.user_id` (no `userId`)
4. [ ] **Imports correctos** de `RequestWithUser`
5. [ ] **Rutas de import** ajustadas según ubicación

---

## 🎯 **RESULTADO ESPERADO**

### **Después de completar FASE 1:**
- ✅ **Eliminación completa** del uso de `any` en controladores
- ✅ **Validación automática** de propiedades de `req.user`
- ✅ **IntelliSense completo** para objetos de request
- ✅ **Prevención de errores** por propiedades inexistentes
- ✅ **Mejor experiencia** de desarrollo

### **Métrica de progreso:**
- **Archivos corregidos:** 0/4
- **Métodos corregidos:** 0/12
- **Errores `any` eliminados:** 0/12

---

## 🚨 **ORDEN DE EJECUCIÓN RECOMENDADO**

1. **PRIMERO:** `student-invitations.controller.ts` (3 métodos)
2. **SEGUNDO:** `professor-availability.controller.ts` (4 métodos)  
3. **TERCERO:** `advisory-attendance.controller.ts` (2 métodos)
4. **CUARTO:** `advisories.controller.ts` (3 métodos)

---

## 📝 **NOTAS IMPORTANTES**

- **NO tocar otros archivos** durante esta fase
- **Verificar cada archivo** individualmente antes de continuar
- **Probar compilación** después de cada corrección
- **Documentar cualquier problema** encontrado durante la corrección