# 📊 Diagramas UML del Sistema de Asesorías

Esta carpeta contiene todos los diagramas UML del Sistema de Asesorías Universitarias en formato PlantUML.

## 📋 Lista de Diagramas

### 1. **01-use-cases.puml**
**Diagrama de Casos de Uso**
- Muestra todos los actores del sistema (Estudiante, Profesor, Administrador)
- Define los casos de uso por módulo funcional
- Incluye relaciones y dependencias entre casos de uso
- **Para presentar:** Visión general del sistema y funcionalidades

### 2. **02-sequence-main-flow.puml**
**Diagrama de Secuencia - Flujo Principal**
- Secuencia completa desde solicitud hasta completar sesión
- Muestra interacción entre actores, sistema y servicios
- Incluye manejo de notificaciones automáticas
- **Para presentar:** Cómo funciona el flujo principal paso a paso

### 3. **03-architecture.puml**
**Diagrama de Arquitectura del Sistema**
- Arquitectura completa Frontend + Backend + Infrastructure
- Muestra tecnologías específicas (NestJS, React, PostgreSQL, Redis)
- Conexiones entre capas y servicios externos
- **Para presentar:** Arquitectura técnica y escalabilidad

### 4. **04-state-diagram.puml**
**Diagrama de Estados - Solicitudes**
- Estados de las solicitudes de asesoría
- Transiciones válidas entre estados
- Condiciones y eventos que disparan cambios
- **Para presentar:** Lógica de negocio y flujo de estados

### 5. **05-activity-diagram.puml**
**Diagrama de Actividades - Proceso Completo**
- Flujo de actividades detallado con decisiones
- Procesos paralelos (notificaciones, recordatorios)
- Manejo de excepciones y casos especiales
- **Para presentar:** Proceso de negocio detallado

### 6. **06-class-diagram.puml**
**Diagrama de Clases - Modelo de Dominio**
- Clases principales del sistema
- Relaciones entre entidades
- Atributos y métodos clave
- **Para presentar:** Estructura de datos y modelo conceptual

### 7. **07-component-diagram.puml**
**Diagrama de Componentes**
- Componentes del sistema por capas
- Interfaces y dependencias
- Organización modular del código
- **Para presentar:** Arquitectura de software detallada

## 🖼️ Cómo Generar las Imágenes

### Opción 1: PlantUML Online (Más Fácil)
1. Ve a: [http://www.plantuml.com/plantuml/uml](http://www.plantuml.com/plantuml/uml)
2. Copia el contenido de cualquier archivo `.puml`
3. Pégalo en el editor online
4. Descarga como PNG o SVG

### Opción 2: VS Code con Extensión
1. Instala la extensión "PlantUML" en VS Code
2. Abre cualquier archivo `.puml`
3. Presiona `Alt + D` para preview
4. Clic derecho → "Export Current Diagram"

### Opción 3: Línea de Comandos
```bash
# Instalar PlantUML
npm install -g node-plantuml

# Generar todas las imágenes
plantuml -tpng *.puml

# O generar una específica
plantuml -tpng 01-use-cases.puml
```

## 📁 Estructura de Salida Sugerida

Crear carpeta `images/` con:
```
docs/UML/images/
├── 01-use-cases.png
├── 02-sequence-main-flow.png  
├── 03-architecture.png
├── 04-state-diagram.png
├── 05-activity-diagram.png
├── 06-class-diagram.png
└── 07-component-diagram.png
```

## 🎯 Recomendaciones para la Presentación

### **Para Clientes No Técnicos:**
1. **01-use-cases.puml** - Qué hace el sistema
2. **04-state-diagram.puml** - Cómo funcionan las solicitudes
3. **05-activity-diagram.puml** - Proceso completo de negocio

### **Para Equipos Técnicos:**
1. **03-architecture.puml** - Arquitectura y tecnologías
2. **06-class-diagram.puml** - Modelo de datos
3. **07-component-diagram.puml** - Organización del código

### **Para Stakeholders:**
1. **02-sequence-main-flow.puml** - Flujo principal del usuario
2. **05-activity-diagram.puml** - Procesos automatizados
3. **01-use-cases.puml** - Funcionalidades del sistema

## 🔄 Actualización de Diagramas

Estos diagramas reflejan el estado actual del sistema. Si se hacen cambios en:
- **Funcionalidades:** Actualizar `01-use-cases.puml`
- **Base de datos:** Actualizar `06-class-diagram.puml`
- **Arquitectura:** Actualizar `03-architecture.puml` y `07-component-diagram.puml`
- **Procesos:** Actualizar `04-state-diagram.puml` y `05-activity-diagram.puml`

---

**📞 Contacto:** Para cualquier actualización o duda sobre los diagramas, contactar al equipo de desarrollo.