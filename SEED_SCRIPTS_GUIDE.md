# 🌱 Scripts de Seed para Base de Datos

## 🚀 Scripts NPM Disponibles

### **Método 1: Solo ejecutar seed (servidor ya corriendo)**
```bash
npm run seed
# o también:
npm run db:seed
```
**Requisitos:** El servidor debe estar corriendo en `http://localhost:3000`

### **Método 2: Reset completo + Seed (automático)**
```bash
npm run seed:reset
# o también:
npm run db:reset
```
**Funcionalidad:** 
- Inicia automáticamente el servidor NestJS
- Espera a que esté listo
- Ejecuta el seed
- Mantiene el servidor corriendo

## ⚡ Uso Rápido

### Para desarrollo diario:
```bash
# Si tu servidor ya está corriendo
npm run seed

# Si quieres empezar desde cero
npm run seed:reset
```

### Primera vez o después de limpiar la DB:
```bash
# Después de ejecutar el script SQL de reset-database.sql
npm run seed:reset
```

## 🎯 Lo que hacen los scripts

### `npm run seed`
1. ✅ Verifica que el servidor esté corriendo
2. 📡 Hace petición POST a `/seed/database`
3. 👥 Muestra los usuarios creados
4. 🔑 Muestra las credenciales de prueba

### `npm run seed:reset`
1. 🚀 Inicia servidor NestJS automáticamente
2. ⏳ Espera a que esté completamente listo
3. 📡 Ejecuta el seed
4. 🎉 Mantiene el servidor corriendo para desarrollo
5. ⚠️ Presiona Ctrl+C para detener

## 👤 Usuarios Creados

| Rol | Username | Password | Email |
|-----|----------|----------|-------|
| **Admin** | `admin` | `123456` | admin@itson.edu.mx |
| **Profesor** | `mgarcia` | `123456` | maria.garcia@itson.edu.mx |
| **Estudiante** | `alopez` | `123456` | ana.lopez@potros.itson.edu.mx |

## 🔧 Troubleshooting

**Error "No se pudo conectar al servidor":**
```bash
# Asegúrate de que PostgreSQL esté corriendo
Get-Service postgresql-x64-16

# Si usas npm run seed (no seed:reset), inicia el servidor primero
npm run start:dev
```

**Error de timeout:**
- El script `seed:reset` espera hasta 60 segundos
- Si tu aplicación tarda más en iniciar, aumenta el timeout en `scripts/reset-and-seed.js`

**Para limpiar completamente la DB antes del seed:**
1. Ejecuta el script SQL `reset-database.sql` en pgAdmin
2. Luego ejecuta `npm run seed:reset`

## 📁 Archivos del Sistema

- `scripts/seed.js` - Script para ejecutar seed con servidor corriendo
- `scripts/reset-and-seed.js` - Script completo que inicia servidor y hace seed
- `reset-database.sql` - Script SQL para limpiar tablas manualmente

## 🎨 Personalización

Para modificar los datos del seed, edita:
`src/seed/seed.service.ts` - Método `createUsers()`