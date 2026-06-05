# 🏪 SGI — Sistema de Gestión de Inventario (Tercer Parcial)

Sistema de gestión de inventario full-stack con autenticación JWT, catálogo de productos por categorías, control de stock, historial de auditoría y reportes exportables.

🔗 **Repositorio Oficial**: [https://github.com/PortillaVanya/Tercer-Parcial-Electiva-3-](https://github.com/PortillaVanya/Tercer-Parcial-Electiva-3-)

---

## 🚀 ¿Qué se implementó en este Parcial?

| Área | Qué se hizo |
|------|-------------|
| **Autenticación** | Login con JWT + cookie httpOnly, guard por rol (admin/user), logout seguro |
| **Refresh Tokens** | Rotación automática de JWT con tokens de 15min (access) y 7 días (refresh) |
| **Validación de Contraseñas** | Requisitos fuertes: 12 caracteres, mayúsculas, minúsculas, números, caracteres especiales |
| **Headers de Seguridad** | Helmet con CSP, HSTS, X-Frame-Options, Referrer-Policy y más |
| **Sanitización de Inputs** | Pipe personalizado para prevenir XSS escapando caracteres peligrosos |
| **Recuperación de Contraseña** | Sistema con tokens seguros, prevención de enumeración y rate limiting |
| **Verificación de Email** | Tokens de 24 horas, invalidación automática y rate limiting |
| **Backup de Datos** | Exportación/Importación JSON con exclusión de contraseñas |
| **Catálogo de Productos** | CRUD completo con paginación, búsqueda y filtrado por categoría |
| **Categorías** | 4 categorías base: Electrónica, Hogar, Deportes, Juguetes |
| **Productos con imágenes** | 30+ productos con imágenes únicas de Unsplash distribuidos por categoría |
| **Inventario / Stock** | Stock actual, stock mínimo, ubicación y alertas de stock bajo |
| **Historial de Auditoría** | Registro cronológico de movimientos de inventario |
| **Seed automático** | Datos de prueba (admin, categorías, 30+ productos) creados al iniciar el backend |
| **Dashboard BI** | Métricas: valor total, productos en alerta, distribución por categoría |
| **Exportación** | Descarga del inventario en **CSV** y **PDF** |
| **Perfil de usuario** | Vista del perfil del administrador autenticado |
| **Proxy Vite → Backend** | Configuración de proxy `/api → http://localhost:8080` en Vite para evitar CORS en desarrollo |
| **Soft Delete** | Borrado lógico de productos para preservar integridad de auditoría |
| **Diseño Premium** | Interfaz oscura con glassmorphism, gradientes, animaciones Framer Motion |
| **Sistema de Proveedores** | CRUD completo de proveedores y órdenes de compra en frontend |
| **Corrección de Órdenes de Compra** | Solución de validación DTO y actualización de servicio para guardar órdenes correctamente en la base de datos |
| **Búsqueda Global** | Componente de búsqueda con atajo Ctrl+K para productos, categorías y proveedores |
| **Filtros Avanzados** | Filtros de precio, stock y ordenamiento en página de productos |
| **Dashboard en Tiempo Real** | Actualizaciones en tiempo real con WebSocket y gráficos de actividad |
| **Notificaciones por Email** | Envío automático de emails para ventas, cambios de inventario y alertas |
| **Panel de Notificaciones** | Recepción en tiempo real de notificaciones por WebSocket |
| **Configuración Docker** | Docker Compose con PostgreSQL, Backend, Frontend y Nginx |
| **Dockerfiles Seguros** | Multi-stage builds con node:24-alpine y usuario non-root |
| **CORS Seguro** | Configuración con .filter(Boolean) y lectura desde variable de entorno |
| **Endpoint /health** | Endpoint de telemetría colocado antes de middlewares de seguridad |
| **CI/CD GitHub Actions** | Pipeline automatizado para linting, tests y build |
| **Base de Datos Flexible** | Soporte para SQLite (desarrollo) y PostgreSQL (Docker/producción) |

---

## 🗂️ Arquitectura del Proyecto

```
Parcial-Electiva/
├── backend/                     # Servidor NestJS 11
│   ├── src/
│   │   ├── auth/                # JWT: login, register, logout, guard
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/             # LoginDto, RegisterDto
│   │   │   └── guards/          # JwtAuthGuard, RolesGuard
│   │   ├── productos/           # CRUD de productos + KPIs
│   │   ├── categoria/           # CRUD de categorías
│   │   ├── inventario/          # Logs y movimientos de stock
│   │   ├── usuarios/            # Perfil y gestión de usuarios
│   │   ├── proveedores/         # CRUD de proveedores y órdenes de compra
│   │   ├── notificaciones/      # Sistema de notificaciones (Email, Slack, WhatsApp)
│   │   ├── ventas/              # Gestión de ventas
│   │   ├── websockets/          # Gateway WebSocket para tiempo real
│   │   ├── modules/rol/         # Entidad y enum de roles
│   │   ├── common/              # Filtros globales, enums, decoradores
│   │   ├── seed.service.ts      # Datos iniciales automáticos (30+ productos)
│   │   └── main.ts              # CORS, cookies, Swagger, ValidationPipe
│   ├── scripts/                 # Scripts de backup y restauración
│   │   ├── backup-db.sh
│   │   └── restore-db.sh
│   ├── nginx/                   # Configuración Nginx para producción
│   │   ├── nginx.conf
│   │   └── ssl/                 # Directorio para certificados SSL
│   ├── Dockerfile
│   ├── docker-compose.yml       # MySQL + Redis + NestJS + Frontend + Nginx
│   └── .env.production.example  # Variables de entorno para producción
├── frontend/                    # Cliente React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts         # Instancia Axios (baseURL='/api', withCredentials)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProductosPage.tsx
│   │   │   ├── InventarioPage.tsx
│   │   │   ├── PerfilPage.tsx
│   │   │   └── ProveedoresPage.tsx
│   │   ├── store/               # Zustand: authStore, productStore, inventoryStore, proveedorStore
│   │   ├── components/          # UI reutilizable: Button, Input, Card, Sidebar, GlobalSearch
│   │   ├── layouts/             # DashboardLayout con sidebar y notificaciones
│   │   ├── lib/                 # Socket.io client para WebSocket
│   │   └── routes/              # Router con rutas protegidas (ProtectedRoute)
│   ├── nginx.conf               # Configuración Nginx para frontend
│   ├── Dockerfile
│   └── .env.example             # Variables de entorno para frontend
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD Pipeline para GitHub Actions
└── README.md
```

---

## 🌟 Características Destacadas

- ✅ **Login seguro**: JWT almacenado en cookie httpOnly (no expuesto a JavaScript)
- ✅ **30+ productos** con imágenes únicas de Unsplash, organizados en 4 categorías
- ✅ **Dashboard BI**: valor total del inventario, alertas de stock bajo, gráfico de distribución
- ✅ **Dashboard en tiempo real**: actualizaciones automáticas con WebSocket
- ✅ **Historial de auditoría**: cada movimiento de stock queda registrado con timestamp
- ✅ **Exportación CSV y PDF**: reportes gerenciales descargables desde el dashboard
- ✅ **Borrado lógico (Soft Delete)**: los productos eliminados se preservan en la base de datos
- ✅ **Seed automático**: al iniciar el backend se crean los datos de prueba si no existen
- ✅ **Swagger**: documentación automática de la API en `/api-docs`
- ✅ **Proxy Vite**: la configuración `/api` evita errores CORS durante el desarrollo
- ✅ **Sistema de Proveedores**: gestión completa de proveedores y órdenes de compra
- ✅ **Corrección de Órdenes de Compra**: solucionado el problema de validación del campo `precioUnitario` para guardar órdenes correctamente
- ✅ **Búsqueda Global**: búsqueda unificada con atajo Ctrl+K
- ✅ **Filtros Avanzados**: filtrado por precio, stock y ordenamiento
- ✅ **Notificaciones por Email**: envío automático para eventos importantes
- ✅ **Panel de Notificaciones**: recepción en tiempo real por WebSocket
- ✅ **Configuración Docker**: orquestación completa con Docker Compose
- ✅ **HTTPS/SSL**: soporte para conexiones seguras con Nginx
- ✅ **Scripts de Backup**: automatización de backup de base de datos
- ✅ **CI/CD**: pipeline automatizado con GitHub Actions

---

## � Seguridad Avanzada

El SGI implementa un conjunto completo de medidas de seguridad profesionales para proteger la aplicación y los datos de los usuarios:

### Headers de Seguridad con Helmet y CSP
- **Content Security Policy (CSP)** con directivas estrictas para prevenir XSS
- **HSTS** (HTTP Strict Transport Security) con max-age de 1 año
- **X-Frame-Options** para prevenir clickjacking
- **Referrer-Policy** para protección de privacidad
- **Cross-Origin policies** para control de interacciones cross-origin

### Autenticación y Tokens
- **Access tokens de 15 minutos** - Ventana de ataque mínima
- **Refresh tokens de 7 días** con rotación automática
- **Revocación individual y masiva** de tokens
- **Cookies httpOnly y secure** - Protección contra XSS y MITM
- **Metadatos de sesión** - IP y User-Agent almacenados

### Validación de Contraseñas
- **Mínimo 12 caracteres** (incrementado desde 8)
- **Al menos una mayúscula, minúscula, número y carácter especial**
- **Hashing con bcrypt factor 12** (incrementado desde 10)

### Sanitización de Inputs
- **Pipe de sanitización** que escapa caracteres peligrosos (<, >, ", ', /, &)
- **Sanitización recursiva** para objetos anidados y arrays
- **Aplicación en endpoints críticos** (registro, login, recuperación)

### Recuperación de Contraseña
- **Tokens seguros** generados con `randomBytes(32)`
- **Expiración de 1 hora** con rate limiting (3 solicitudes/min)
- **Prevención de enumeración** - No revela si email existe
- **Revocación de sesiones** al cambiar contraseña

### Verificación de Email
- **Tokens de 24 horas** con invalidación automática
- **Rate limiting** para prevenir spam
- **Endpoints protegidos** para reenvío

### Sistema de Backup
- **Exclusión de contraseñas** en backups
- **Exportación JSON** con metadatos (timestamp, versión)
- **Restauración ordenada** respetando dependencias
- **Endpoints protegidos** con autenticación

### Corrección de Órdenes de Compra
- **Problema Identificado**: El campo `precioUnitario` en el DTO estaba definido como `string` pero el frontend lo enviaba como `number`, causando errores de validación
- **Solución Aplicada**:
  - Actualizado el DTO `CreateOrdenCompraDto` para aceptar `precioUnitario` como tipo `number` con `@IsNumber()`
  - Eliminadas las conversiones innecesarias de `Number()` en el servicio de proveedores
  - Reinicio del servidor backend para aplicar cambios
- **Resultado**: Las órdenes de compra ahora se crean y guardan correctamente en la base de datos

---

## ⚙️ Requisitos Técnicos Implementados

### 1. Docker y Docker Compose (Entorno Local Full-Stack)
- **Dockerfiles Seguros**:
  - Imagen Base Minimalista: `node:24-alpine` para frontend y backend
  - Principio de Menor Privilegio: `USER node` en contenedores
  - Instalación Limpia: Multi-stage builds y `npm ci --omit=dev`
- **Docker Compose**:
  - Orquestación con PostgreSQL, Backend y Frontend
  - Variables de entorno desde `.env`
  - Healthcheck para base de datos

### 2. Pipelines de CI/CD (GitHub Actions)
- **Workflow de Integración Continua**:
  - Ejecuta `npm ci` (limpia), linting, tests y build para frontend y backend
  - Trigger en push/pr a `main`
- **Despliegue Continuo**:
  - Webhook para actualización automática en producción (configurable)

### 3. Blindaje de Red y Monitoreo Operativo
- **CORS Seguro**:
  - Lectura desde variable `CORS_ORIGIN`
  - Limpieza con `.split(',').map().trim().filter(Boolean)`
- **Estrategia Keep-Alive**:
  - Endpoint `/health` antes de middlewares de seguridad
  - Devuelve estado, timestamp y uptime
- **Base de Datos Flexible**:
  - SQLite para desarrollo local
  - PostgreSQL para Docker y producción

---

## 🛠️ Instalación y Ejecución

### Prerrequisitos
- **Docker Desktop** (para ejecución con Docker)
- **Node.js 24+** y **npm** (para desarrollo local)
- **Git** (para clonar el repositorio)

### Configuración de Variables de Entorno

**Proyecto completo (raíz):**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

Variables importantes:
- `JWT_SECRET`: String seguro de 32+ caracteres
- `DB_TYPE`: `sqlite` (desarrollo) o `postgres` (Docker)
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Para PostgreSQL
- `CORS_ORIGIN`: Orígenes permitidos (ej: `http://localhost:5173,http://localhost:80`)
- `VITE_API_URL`: URL del backend (ej: `http://localhost:3000`)

---

### 🚀 Ejecución en Desarrollo Local (SQLite)

#### Paso 1 — Levantar Backend
```bash
cd backend
npm install
npm start
```

#### Paso 2 — Levantar Frontend (nueva terminal)
```bash
cd frontend
npm install
npm run dev
```

El frontend estará en: **http://localhost:5173**  
El backend estará en: **http://localhost:3000**  
Health check: **http://localhost:3000/health**

---

### 🚀 Ejecución con Docker Compose (PostgreSQL)

#### Paso 1 — Configurar .env
Copia el ejemplo y configura:
```bash
cp .env.example .env
# Establece DB_TYPE=postgres
```

#### Paso 2 — Levantar todos los servicios
```bash
docker compose up --build -d
```

Esto levanta:
- `db` — PostgreSQL 16-alpine en el puerto `5432`
- `backend` — API NestJS en el puerto `3000`
- `frontend` — Frontend React (servido por Nginx) en el puerto `80`

#### Paso 3 — Verificar estado
```bash
docker compose ps
docker compose logs -f
```

La aplicación estará en:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health check**: http://localhost:3000/health

---

### 🚀 Ejecución en Producción

#### Paso 1 — Configurar Certificados SSL

Crea el directorio para certificados:
```bash
cd backend/nginx/ssl
```

Genera certificados SSL auto-firmados (para desarrollo):
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=CO/ST=Estado/L=Ciudad/O=Organizacion/CN=tu-dominio.com"
```

**Para producción:** Usa certificados reales de Let's Encrypt:
```bash
sudo certbot certonly --nginx -d tu-dominio.com
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem backend/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem backend/nginx/ssl/key.pem
```

#### Paso 2 — Levantar Todos los Servicios

```bash
cd backend
docker compose up --build -d
```

Esto levanta cinco contenedores:
- `mysql_inventory` — MySQL 8.0
- `redis_inventory` — Redis 7
- `nestjs_backend` — API NestJS
- `react_frontend` — Frontend React con Nginx
- `nginx_proxy` — Proxy inverso con HTTPS/SSL

#### Paso 3 — Verificar Despliegue

```bash
# Verificar estado de contenedores
docker compose ps

# Ver logs de servicios
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

La aplicación estará disponible en:
- **HTTPS**: `https://tu-dominio.com`
- **HTTP**: `http://tu-dominio.com` (redirige a HTTPS)

---

### 🔄 Scripts de Backup

**Backup de Base de Datos:**
```bash
cd backend/scripts
chmod +x backup-db.sh
./backup-db.sh
```

**Restaurar Base de Datos:**
```bash
cd backend/scripts
chmod +x restore-db.sh
./restore-db.sh backup_20240530_120000.sql.gz
```

Los backups se guardan en `/backups` y se mantienen los últimos 7 días automáticamente.

---

## 🔐 Credenciales de Acceso

| Campo | Valor |
|-------|-------|
| URL | [http://localhost:5173](http://localhost:5173) |
| Email | `admin@admin.com` |
| Contraseña | `admin123` |

---

## 🔗 Endpoints Principales del Backend

### Autenticación y Seguridad
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Iniciar sesión (retorna cookies JWT y refresh token) |
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/refresh` | Rotar refresh token |
| POST | `/auth/revoke` | Revocar refresh token específico |
| POST | `/auth/revoke-all` | Revocar todos los tokens del usuario |
| POST | `/auth/request-password-reset` | Solicitar recuperación de contraseña |
| POST | `/auth/reset-password` | Restablecer contraseña con token |
| POST | `/auth/send-verification-email` | Reenviar email de verificación |
| POST | `/auth/verify-email` | Verificar email con token |

### Productos e Inventario
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios/profile` | Perfil del usuario autenticado |
| GET | `/productos/pagination` | Listado paginado de productos |
| POST | `/productos` | Crear producto |
| PATCH | `/productos/:id` | Actualizar producto |
| DELETE | `/productos/:id` | Borrado lógico de producto |
| GET | `/categoria` | Listar categorías |
| POST | `/categoria` | Crear categoría |
| GET | `/inventario/logs` | Historial de movimientos |
| GET | `/productos/health` | Métricas de salud del inventario |

### Proveedores
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/proveedores` | Listar proveedores |
| POST | `/proveedores` | Crear proveedor |
| PATCH | `/proveedores/:id` | Actualizar proveedor |
| DELETE | `/proveedores/:id` | Eliminar proveedor |
| GET | `/proveedores/ordenes` | Listar órdenes de compra |
| POST | `/proveedores/ordenes` | Crear orden de compra |

### Notificaciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/notificaciones/usuario/:id` | Obtener notificaciones del usuario |
| POST | `/notificaciones` | Crear notificación |
| PATCH | `/notificaciones/:id/leer` | Marcar como leída |
| POST | `/notificaciones/test` | Crear notificación de prueba |

### Backup
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/backup/export` | Exportar backup completo como JSON |
| POST | `/backup/restore` | Restaurar desde backup JSON |
| GET | `/backup/preview` | Previsualizar backup |

Documentación Swagger: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## � CI/CD Pipeline

El proyecto incluye un workflow de GitHub Actions que automatiza:

- **Backend Tests**: Ejecuta linter, tests unitarios y build del backend
- **Frontend Tests**: Ejecuta linter y build del frontend
- **Docker Build**: Construye y valida las imágenes Docker
- **Security Scan**: Ejecuta npm audit para detectar vulnerabilidades

El pipeline se ejecuta automáticamente en cada push a las ramas `main` y `develop`, y en cada pull request a `main`.

---

## �📦 Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| NestJS | 11 | Framework backend modular |
| TypeORM | 0.3 | ORM para MySQL |
| MySQL | 8.0 | Base de datos relacional |
| JWT + Passport | - | Autenticación y autorización |
| bcryptjs | 3 | Hash de contraseñas |
| class-validator | 0.14 | Validación de DTOs |
| Swagger | 11 | Documentación automática |
| Docker | - | Contenedores y orquestación |

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | UI library |
| Vite | 6 | Bundler y dev server |
| TypeScript | 5.7 | Tipado estático |
| Zustand | - | Gestión de estado global |
| Axios | - | Cliente HTTP con interceptores |
| Framer Motion | - | Animaciones premium |
| Lucide React | - | Iconografía |
| Sonner | - | Notificaciones toast |
| Tailwind CSS v4 | - | Estilos utilitarios |
| jsPDF | - | Generación de reportes PDF |

---

## � Solución de Problemas

### Contenedores no inician

```bash
# Ver logs de contenedores
docker compose logs -f

# Reconstruir contenedores
docker compose down
docker compose up --build -d

# Limpiar caché de Docker
docker system prune -a
```

### Errores de conexión a base de datos

```bash
# Verificar que MySQL esté listo
docker compose exec db mysqladmin ping -h localhost

# Reiniciar contenedor de base de datos
docker compose restart db
```

### Errores de WebSocket

```bash
# Verificar que el puerto 8080 esté accesible
curl http://localhost:8080

# Verificar configuración de CORS en .env
# CORS_ORIGIN debe coincidir con tu dominio
```

### Errores de Email

```bash
# Verificar configuración SMTP en .env
# Para Gmail, usa App Password en lugar de contraseña normal
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=tu-email@gmail.com
# SMTP_PASS=tu-app-password
```

### Certificados SSL

```bash
# Para desarrollo, usa certificados auto-firmados
# Para producción, usa Let's Encrypt
sudo certbot certonly --nginx -d tu-dominio.com
```

---

## 📊 Monitoreo y Logs

### Ver logs en tiempo real
```bash
# Backend
docker compose logs -f backend

# Frontend
docker compose logs -f frontend

# Nginx
docker compose logs -f nginx

# Todos los servicios
docker compose logs -f
```

### Verificar estado de servicios
```bash
docker compose ps
```

### Acceder a contenedores
```bash
# Backend
docker compose exec backend bash

# MySQL
docker compose exec db mysql -u root -p

# Redis
docker compose exec redis redis-cli
```

---

## 🚀 Comandos Útiles

### Backend
```bash
# Ejecutar tests
npm run test

# Ejecutar tests con cobertura
npm run test:cov

# Linting
npm run lint

# Build para producción
npm run build

# Ejecutar en producción
npm run start:prod
```

### Frontend
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint
```

### Docker
```bash
# Levantar todos los servicios
docker compose up -d

# Levantar con reconstrucción
docker compose up --build -d

# Detener servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v

# Ver logs
docker compose logs -f

# Ejecutar comando en contenedor
docker compose exec backend npm run test
```

---

## �👨‍💻 Autores

- **Vanya Catalina Portilla Sanchez**
- **Andres Alirio Bubrano Solarte**
- **Franklin Sneider Cordoba de la Cruz**
- **Jhonatan Mauricio Muchavisoy**
- **Jaider Chindoy**

---

Desarrollado para la asignatura de **Electiva III** — Tercer Parcial 2026.
