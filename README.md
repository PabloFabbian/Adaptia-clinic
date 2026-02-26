# Adaptia 🧠
### Plataforma de Gestión Clínica Colaborativa para Psicólogos

> Un sistema diseñado bajo el paradigma de **colaboración horizontal**: los profesionales crecen juntos sin sacrificar su autonomía, privacidad ni propiedad intelectual.

---

## 📋 Tabla de Contenidos

- [¿Qué es Adaptia?](#-qué-es-adaptia)
- [Características Principales](#-características-principales)
- [Arquitectura del Monorepo](#-arquitectura-del-monorepo)
- [Stack Tecnológico](#-stack-tecnológico)
- [Sistema de Permisos](#-sistema-de-permisos)
- [Flujo de Privacidad y Consentimientos](#-flujo-de-privacidad-y-consentimientos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Debugging y Verificación](#-debugging-y-verificación)
- [Roadmap](#-roadmap)

---

## 🎯 ¿Qué es Adaptia?

**Adaptia** es una plataforma CRM para clínicas y consultorios psicológicos que resuelve un problema frecuente en el sector: los sistemas de gestión clínica suelen ser rígidos, centralistas y no contemplan la naturaleza colaborativa —pero autónoma— del trabajo entre profesionales de la salud mental.

A diferencia de los CRM tradicionales, Adaptia introduce un modelo de **gobernanza dinámica** donde cada psicólogo conserva la propiedad de sus datos y decide con quién y en qué medida compartirlos, incluso dentro de la misma clínica.

---

## ✨ Características Principales

- **Colaboración entre iguales** — sin jerarquías artificiales entre profesionales
- **Sistema de permisos granular** — basado en capacidades (`capabilities`) por rol y sede
- **Consentimiento de recursos** — cada profesional controla el acceso a sus propios datos
- **Revocación instantánea** — al retirar el consentimiento, los datos desaparecen de la vista administrativa de forma inmediata
- **Multi-sede** — un profesional puede tener distintos roles en distintas clínicas
- **Modo Maestro (Tech Owner)** — bypass de gobernanza para soporte técnico y administración global
- **Interfaz adaptativa** — el Sidebar se reconfigura dinámicamente según el rango y contexto del usuario

---

## 🗂️ Arquitectura del Monorepo

```
Adaptia-CRM/
├── Adaptia-Frontend/     # Aplicación React (cliente)
├── Adaptia-Backend/      # API REST (servidor)
└── README.md
```

El proyecto está organizado como un monorepo con dos paquetes independientes: frontend y backend.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React + Context API |
| **Enrutamiento** | React Router |
| **Base de datos** | Neon DB (PostgreSQL serverless) |
| **Lenguaje** | JavaScript (99%+) |
| **Gestión de estado** | Context API + hooks personalizados |

---

## 🔐 Sistema de Permisos

El motor de permisos de Adaptia es un sistema **híbrido RBAC + Consentimiento** con dos capas complementarias:

### 1. RBAC — Role-Based Access Control

Basado en tres entidades sincronizadas con la base de datos:

| Entidad | Descripción | Ejemplo |
|--------|-------------|---------|
| **Roles** | Definiciones globales de función | `Tech Owner`, `Administrador`, `Psicólogo` |
| **Capabilities** | Slugs técnicos de acción permitida | `clinic.patients.read`, `clinic.billing.write` |
| **Members** | Relación Usuario ↔ Sede con rol asignado | Usuario X es `Psicólogo` en Sede A y `Administrador` en Sede B |

La tabla `members` es el registro maestro que vincula usuarios con sedes. La tabla `role_capabilities` es el mapa que conecta cada rol con sus capacidades habilitadas.

### 2. Bypass de Gobernanza — Master Mode

Para garantizar la operatividad total del sistema, el rol **Tech Owner** (ID: 17) implementa un bypass maestro que:

- Omite las validaciones restrictivas de `userPermissions`
- Garantiza acceso a módulos críticos: **Gobernanza de Sedes**, **Facturación Global**, **Categorías de Sistema** y **Papelera de Recuperación**
- Habilita automáticamente el contexto de clínica para una navegación ininterrumpida

---

## 🔒 Flujo de Privacidad y Consentimientos

Los datos sensibles operan bajo un modelo de **Consentimiento Otorgado** en tres pasos:

```
Profesional  ──otorga acceso──►  Clínica  ──distribuye visibilidad──►  Miembros con Capacidad
     │                                                                          │
     └──── revoca consentimiento ◄──────────────────────────────────────────────┘
           (datos desaparecen instantáneamente de la vista administrativa)
```

1. El profesional **otorga** acceso de sus recursos a la clínica
2. La clínica **distribuye** visibilidad solo a miembros que poseen la capacidad necesaria
3. La **revocación es instantánea**: si el profesional retira su consentimiento, sus datos dejan de ser visibles para la administración de la clínica de forma inmediata

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- Cuenta en [Neon DB](https://neon.tech) (PostgreSQL serverless)

### Frontend

```bash
cd Adaptia-Frontend
npm install
npm run dev
```

### Backend

```bash
cd Adaptia-Backend
npm install
npm run dev
```

### Variables de entorno

Crear un archivo `.env` en cada paquete según el `.env.example` correspondiente. Como mínimo, configurar la cadena de conexión a Neon DB.

---

## 📁 Estructura del Proyecto

### Frontend (puntos de entrada clave)

```
Adaptia-Frontend/src/
├── context/
│   └── AuthContext.jsx        # Cerebro del sistema: hidratación de usuario, normalización de datos, refresco de capacidades
├── components/
│   ├── Sidebar.jsx            # Interfaz adaptativa según rol y capacidades del usuario
│   └── ClinicSelector.jsx     # Control de contexto: garantiza siempre una sede activa seleccionada
└── ...
```

### Backend (puntos de entrada clave)

```
Adaptia-Backend/
├── ...                        # Rutas, controladores y modelos de la API REST
└── ...
```

---

## 🧪 Debugging y Verificación

Para inspeccionar el estado actual del usuario autenticado desde la consola del navegador (`F12`):

```javascript
// Estado del usuario y membresías
console.log(JSON.parse(localStorage.getItem('adaptia_user')));

// Clínica activa y rol asignado
console.log(JSON.parse(localStorage.getItem('adaptia_active_clinic')));
```

---

## 🗺️ Roadmap

- [ ] Panel de analítica clínica
- [ ] Módulo de facturación por obra social
- [ ] Notificaciones en tiempo real
- [ ] Exportación de fichas clínicas en PDF
- [ ] App móvil (React Native)

---

## 👤 Autor

**Pablo Fabbian** — [@PabloFabbian](https://github.com/PabloFabbian)

---

*Adaptia — Gestión clínica pensada por y para los profesionales.*
