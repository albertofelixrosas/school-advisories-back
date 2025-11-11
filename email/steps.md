Summarized conversation history¡Excelente pregunta! Para hacer funcional el sistema de emails, necesitas configurar las credenciales SMTP. Te voy a guiar paso a paso:

## 🔧 **PASOS PARA ACTIVAR EL SISTEMA DE EMAILS**

### **📋 Paso 1: Elegir Proveedor de Email**

Tienes varias opciones:

#### **Opción A: Gmail (Más Fácil para Desarrollo)** ✅ RECOMENDADO

**Ventajas:**
- ✅ Gratis hasta 500 emails/día
- ✅ Fácil configuración
- ✅ Perfecto para desarrollo y pruebas
- ✅ Confiable

**Limitaciones:**
- ⚠️ Límite de 500 emails por día
- ⚠️ Requiere "Contraseña de Aplicación"

#### **Opción B: SendGrid (Producción)**
- ✅ 100 emails gratis al día
- ✅ Mejor para producción
- ✅ Dashboard con métricas
- ⚠️ Requiere cuenta y API key

#### **Opción C: Mailtrap (Solo Testing)**
- ✅ Perfecto para desarrollo
- ✅ No envía emails reales
- ✅ Inbox virtual para probar
- ❌ NO funciona en producción

---

## 📧 **CONFIGURACIÓN CON GMAIL (OPCIÓN RECOMENDADA)**

### **Paso 2: Crear Contraseña de Aplicación en Gmail**

1. **Ve a tu cuenta de Google**: https://myaccount.google.com/
2. **Seguridad** → **Verificación en dos pasos** (debe estar activada)
3. **Contraseñas de aplicaciones**
4. **Selecciona aplicación**: Correo
5. **Selecciona dispositivo**: Otro (escribe "School Advisories")
6. **Generar** → Copia la contraseña de 16 caracteres

### **Paso 3: Actualizar Variables de Entorno**

Abre tu archivo .env.development y actualiza estas variables:

```env
# ===== EMAIL CONFIGURATION =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com                    # ⬅️ TU EMAIL DE GMAIL
SMTP_PASS=abcd efgh ijkl mnop                   # ⬅️ CONTRASEÑA DE APLICACIÓN (16 caracteres)
FROM_EMAIL=tu-email@gmail.com                    # ⬅️ MISMO EMAIL
FROM_NAME=Sistema de Asesorías ITSON            # Nombre que aparecerá en los emails
```

**⚠️ IMPORTANTE:**
- Usa el mismo email en `SMTP_USER` y `FROM_EMAIL`
- La contraseña debe ser de 16 caracteres (con espacios como la generó Google)
- NO uses tu contraseña normal de Gmail

### **Paso 4: Reiniciar el Servidor**

```bash
# Detén el servidor (Ctrl+C)
# Reinicia
npm run start:dev
```

### **Paso 5: Verificar Configuración**

Si todo está bien configurado, deberías ver:

```bash
✅ Email templates initialized successfully
✅ Email service configured correctly
```

Si ves error, verifica:
- ✅ Verificación en dos pasos activada en Gmail
- ✅ Contraseña de aplicación copiada correctamente
- ✅ Variables de entorno sin espacios extras

---

## 🧪 **PROBAR EL SISTEMA DE EMAILS**

### **Opción 1: Probar desde Swagger**

1. Ve a: http://localhost:3000/api
2. Busca el endpoint de notificaciones o advisory-requests
3. Haz una solicitud de asesoría
4. El profesor debería recibir un email automáticamente

### **Opción 2: Crear Script de Prueba**

Crea un archivo `test-email.ts` en la raíz del proyecto:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { EmailService } from './src/email/email.service';

async function testEmail() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailService = app.get(EmailService);

  try {
    const result = await emailService.sendEmail({
      to: 'tu-email-de-prueba@gmail.com',  // ⬅️ TU EMAIL PARA PRUEBA
      subject: '🧪 Prueba del Sistema de Asesorías',
      html: `
        <h1>¡Email funcionando!</h1>
        <p>Si recibes este email, el sistema está configurado correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    if (result) {
      console.log('✅ Email enviado exitosamente');
    } else {
      console.log('❌ Error al enviar email');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

testEmail();
```

Ejecutar:
```bash
npx ts-node test-email.ts
```

---

## 🌐 **CONFIGURACIÓN ALTERNATIVA: MAILTRAP (PARA TESTING)**

Si solo quieres probar sin enviar emails reales:

### **Paso 1: Crear Cuenta en Mailtrap**
1. Ve a: https://mailtrap.io/
2. Regístrate gratis
3. Crea un inbox
4. Copia las credenciales SMTP

### **Paso 2: Configurar Variables**
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu-usuario-mailtrap              # ⬅️ De Mailtrap
SMTP_PASS=tu-contraseña-mailtrap           # ⬅️ De Mailtrap
FROM_EMAIL=noreply@school-advisories.test
FROM_NAME=Sistema de Asesorías
```

**Ventajas de Mailtrap:**
- ✅ No envía emails reales
- ✅ Puedes ver todos los emails en su inbox virtual
- ✅ Perfecto para desarrollo
- ✅ No necesitas preocuparte por límites

---

## 📨 **EMAILS QUE SE ENVÍAN AUTOMÁTICAMENTE**

Una vez configurado, el sistema enviará emails automáticamente en estos casos:

### **1. Nueva Solicitud de Asesoría**
- **A:** Profesor
- **Cuándo:** Estudiante crea solicitud
- **Template:** `advisory_request_new`
- **Contenido:** Nombre estudiante, materia, mensaje

### **2. Solicitud Aprobada**
- **A:** Estudiante
- **Cuándo:** Profesor aprueba solicitud
- **Template:** `advisory_request_approved`
- **Contenido:** Confirmación, fecha/hora, ubicación

### **3. Solicitud Rechazada**
- **A:** Estudiante
- **Cuándo:** Profesor rechaza solicitud
- **Template:** `advisory_request_rejected`
- **Contenido:** Razón del rechazo

### **4. Asesoría Cancelada**
- **A:** Ambas partes
- **Cuándo:** Cualquiera cancela
- **Template:** `advisory_cancelled`
- **Contenido:** Razón de cancelación

---

## 🔍 **TROUBLESHOOTING**

### **Error: "Invalid login: Username and Password not accepted"**

**Causa:** Credenciales incorrectas o verificación en dos pasos no activada

**Solución:**
1. Verifica que la verificación en dos pasos esté activada
2. Genera una nueva contraseña de aplicación
3. Copia exactamente como aparece (con espacios)
4. Reinicia el servidor

### **Error: "Connection timeout"**

**Causa:** Puerto bloqueado por firewall/antivirus

**Solución:**
1. Verifica que `SMTP_PORT=587` (no 465)
2. Desactiva temporalmente el firewall para probar
3. Intenta con puerto 465 y cambia `secure: true` en el código

### **Error: "Self-signed certificate"**

**Causa:** Problema con certificados SSL

**Solución:**
En email.service.ts, agrega:
```typescript
tls: {
  rejectUnauthorized: false  // Solo para desarrollo
}
```

### **Emails no llegan (no hay error)**

**Verifica:**
1. ✅ Revisa carpeta de SPAM
2. ✅ Verifica que el email destino sea correcto
3. ✅ Revisa logs del servidor para confirmar envío
4. ✅ Verifica límite diario de Gmail (500 emails)

---

## 📊 **MONITOREO DE EMAILS**

### **Ver Logs de Notificaciones**

El sistema guarda todos los emails enviados en la base de datos:

```sql
-- Ver últimos emails enviados
SELECT * FROM notification_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver emails fallidos
SELECT * FROM notification_logs 
WHERE sent_successfully = false 
ORDER BY created_at DESC;

-- Contar emails por tipo
SELECT notification_type, COUNT(*) 
FROM notification_logs 
GROUP BY notification_type;
```

### **API Endpoint para Historial**

```typescript
// GET /notifications/history
// Retorna historial de notificaciones del usuario actual
```

---

## 🚀 **CONFIGURACIÓN PARA PRODUCCIÓN**

Cuando estés listo para producción:

### **Opción 1: SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.tu-api-key-de-sendgrid
FROM_EMAIL=noreply@tudominio.com
FROM_NAME=Sistema de Asesorías
```

### **Opción 2: AWS SES**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=tu-access-key
SMTP_PASS=tu-secret-key
FROM_EMAIL=noreply@tudominio.com
FROM_NAME=Sistema de Asesorías
```

### **Opción 3: Servidor SMTP Institucional**
```env
SMTP_HOST=smtp.itson.edu.mx  # Servidor de tu universidad
SMTP_PORT=587
SMTP_USER=tu-usuario-institucional
SMTP_PASS=tu-contraseña-institucional
FROM_EMAIL=asesorias@itson.edu.mx
FROM_NAME=Sistema de Asesorías ITSON
```

---

## ✅ **CHECKLIST DE CONFIGURACIÓN**

```bash
☐ Verificación en dos pasos activada en Gmail
☐ Contraseña de aplicación generada
☐ Variables de entorno actualizadas en .env.development
☐ Servidor reiniciado
☐ Email de prueba enviado exitosamente
☐ Verificado que llegan los emails (revisar spam)
☐ Plantillas de email inicializadas en la BD
☐ Sistema de notificaciones funcionando automáticamente
```

---

¿Con qué opción te gustaría comenzar? ¿Gmail para desarrollo o Mailtrap para testing sin enviar emails reales?