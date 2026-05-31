# Frontend - AdminPanel (Gestión de Inventario)

Este es el cliente del sistema de **Gestión de Inventario**, construido con tecnologías modernas para ofrecer una experiencia de usuario fluida, rápida y estéticamente premium.

## 🚀 Tecnologías Utilizadas
- **React 19**: Biblioteca principal para la interfaz.
- **TypeScript**: Para un desarrollo robusto y tipado.
- **Vite**: Herramienta de construcción ultra rápida.
- **Zustand**: Gestión de estado global ligera y eficiente.
- **Tailwind CSS**: Estilizado moderno y responsivo.
- **Framer Motion**: Animaciones fluidas y micro-interacciones.
- **Lucide React**: Set de iconos consistentes.
- **Axios**: Cliente para peticiones HTTP al backend.

## 📋 Características
- **Dashboard Dinámico**: Visualización de métricas de negocio en tiempo real.
- **Gestión de Productos**: CRUD completo con validaciones y búsqueda.
- **Gestión de Categorías**: Organización lógica del catálogo.
- **Autenticación Protegida**: Rutas seguras mediante JWT.
- **Diseño Adaptativo**: Totalmente compatible con dispositivos móviles y escritorio.
- **Notificaciones**: Feedback visual mediante `sonner` para cada acción del usuario.

## 🛠️ Configuración Local

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno**:
    Crea un archivo `.env` basado en el archivo `.env.example`:
    ```env
    VITE_API_URL=http://localhost:8080
    ```
3.  **Ejecutar en modo desarrollo**:
    ```bash
    npm run dev
    ```

## 🏗️ Estructura de Carpetas
- `src/api`: Configuración de Axios e interceptores.
- `src/components`: Componentes atómicos y de UI reutilizables (Botones, Inputs, Cards).
- `src/layouts`: Estructuras base de las páginas (Navbar, Sidebar).
- `src/pages`: Vistas principales de la aplicación.
- `src/store`: Estado global con Zustand (Auth, Productos, Categorías).
- `src/routes`: Definición y protección de rutas.

---
Desarrollado para la asignatura de **Electiva III**.
