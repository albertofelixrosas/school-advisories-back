# 🔧 Configuración Completa de Gmail API

Este documento explica cómo configurar completamente el sistema de Gmail API para que funcione correctamente.

## 📋 **Requisitos Previos**

1. **Proyecto de Google Cloud** con Gmail API habilitada
2. **Credenciales OAuth2** (Client ID y Client Secret)
3. **Variables de entorno** configuradas

## 🚀 **Pasos de Configuración**

### **Paso 1: Configurar Variables de Entorno**

Copia tu archivo `.env.example` a `.env` y completa estas variables:

```bash
# Gmail API Configuration (Required for email functionality)
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_REFRESH_TOKEN=obten_este_token_del_paso_2
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/gmail/callback

# Email Configuration
FROM_EMAIL=tu-email@gmail.com
FROM_NAME="Sistema de Asesorías"
```

### **Paso 2: Obtener Refresh Token**

1. **Inicia el servidor:**
   ```bash
   npm run start:dev
   ```

2. **Visita el endpoint de autenticación:**
   ```
   http://localhost:3000/auth/gmail
   ```

3. **Sigue el flujo OAuth2:**
   - Se abrirá la pantalla de consentimiento de Google
   - Autoriza a tu aplicación
   - Serás redirigido a una página con el refresh token

4. **Copia el refresh token** a tu archivo `.env`:
   ```bash
   GOOGLE_REFRESH_TOKEN=el_token_que_obtuviste
   ```

5. **Reinicia el servidor:**
   ```bash
   # Ctrl+C para detener
   npm run start:dev
   ```

### **Paso 3: Verificar Configuración**

Ejecuta el script de prueba:

```bash
npx ts-node test-gmail.ts
```

O verifica desde el navegador:
```
http://localhost:3000/auth/gmail/verify
```

## 🧪 **Prueba del Sistema**

El script `test-gmail.ts` hace lo siguiente:

1. ✅ Verifica que todas las variables de entorno estén configuradas
2. ✅ Conecta con la Gmail API usando el refresh token
3. ✅ Envía un email de prueba
4. ✅ Confirma que el sistema está funcionando

## 📨 **Endpoints Disponibles**

| Endpoint | Descripción |
|----------|-------------|
| `GET /auth/gmail` | Inicia el flujo de autenticación OAuth2 |
| `GET /auth/gmail/callback` | Recibe el código y muestra los tokens |
| `GET /auth/gmail/verify` | Verifica si la configuración actual funciona |

## 🔍 **Solución de Problemas**

### **Error: "invalid_client"**
- ✅ Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos
- ✅ Asegúrate de que la Gmail API esté habilitada en Google Cloud Console

### **Error: "invalid_grant"**
- ✅ El refresh token puede haber expirado
- ✅ Obtén un nuevo refresh token visitando `/auth/gmail`

### **Error: "redirect_uri_mismatch"**
- ✅ Verifica que `GOOGLE_REDIRECT_URI` coincida con la configurada en Google Cloud Console
- ✅ Debe ser exactamente: `http://localhost:3000/auth/gmail/callback`

### **Emails no se envían**
- ✅ Verifica que el refresh token sea válido
- ✅ Revisa los logs del servidor para errores
- ✅ Asegúrate de que el email `FROM_EMAIL` sea el mismo que usas para autenticarte

## ✅ **Checklist de Configuración Completa**

```bash
☐ Variables de entorno configuradas en .env
☐ Servidor iniciado sin errores
☐ Visitado /auth/gmail y completado OAuth2
☐ Refresh token copiado a .env
☐ Servidor reiniciado
☐ Verificación en /auth/gmail/verify exitosa
☐ Script de prueba ejecutado correctamente
☐ Email de prueba recibido
```

## 🎯 **Funcionalidades del Sistema**

Una vez configurado, el sistema puede:

- ✅ **Enviar notificaciones automáticas** cuando hay nuevas solicitudes
- ✅ **Confirmar asesorías** via email
- ✅ **Recordatorios** de próximas sesiones
- ✅ **Notificaciones de cambios** en horarios
- ✅ **Reportes** via email

## 📈 **Límites y Consideraciones**

- **Gmail API:** 1,000,000 requests/día (más que suficiente)
- **Rate Limits:** 250 quota units/usuario/100 segundos
- **Emails por día:** Sin límite específico (depende de tu cuenta Gmail)

## 🚀 **Próximos Pasos**

1. **Desarrollo:** Usa la configuración actual
2. **Producción:** Considera usar un servicio dedicado como SendGrid
3. **Monitoreo:** Implementa logs para trackear emails enviados
4. **Plantillas:** Personaliza las plantillas en `EmailTemplateService`

---

¿Necesitas ayuda con algún paso específico? Revisa los logs del servidor o ejecuta el script de prueba para más detalles.