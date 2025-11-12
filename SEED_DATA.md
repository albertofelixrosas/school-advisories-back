# 🌱 Datos de Prueba para School Advisories

## 📝 Usuarios Creados

### 👤 Credenciales de Login

| Tipo | Usuario | Contraseña | Email | Descripción |
|------|---------|------------|-------|-------------|
| **Admin** | `admin` | `123456` | admin@itson.edu.mx | Administrador del sistema |
| **Profesor** | `mgarcia` | `123456` | maria.garcia@itson.edu.mx | María Elena García Hernández |
| **Estudiante** | `alopez` | `123456` | ana.lopez@potros.itson.edu.mx | Ana Sofía López Morales |

## 🚀 Cómo usar

### Endpoints de Seed

1. **Poblar la base de datos:**
   ```http
   POST http://localhost:3000/seed/database
   ```

2. **Ver usuarios disponibles:**
   ```http
   GET http://localhost:3000/seed/users
   ```

### Ejemplo de Login

```json
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

### Respuesta esperada del login:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "Carlos",
    "last_name": "Rodríguez López",
    "email": "admin@itson.edu.mx",
    "role": "admin",
    "dashboard_data": {
      // ... datos específicos del rol
    }
  }
}
```

## 🔧 Testing con Frontend

Puedes usar estos usuarios para probar todas las funcionalidades:

- **Admin**: Acceso completo al sistema
- **Profesor**: Crear asesorías, gestionar horarios, ver estudiantes
- **Estudiante**: Solicitar asesorías, ver calendario, confirmar asistencia

## 📋 Notas Importantes

- Todos los usuarios tienen la misma contraseña: `123456`
- Los usuarios se crean con información realista de ITSON
- Las contraseñas están hasheadas con bcrypt (salt rounds: 10)
- Los emails siguen el formato institucional de ITSON

## 🛠️ Comandos útiles

```bash
# Poblar base de datos
curl -X POST http://localhost:3000/seed/database

# Ver usuarios creados
curl http://localhost:3000/seed/users

# Login como admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```