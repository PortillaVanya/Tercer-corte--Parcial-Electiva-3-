# Backend - AdminPanel (API de Gestión de Inventario)

Este es el servidor del sistema de **Gestión de Inventario**, desarrollado con **NestJS** y **MySQL**. Proporciona una API robusta, segura y escalable para el control de productos, categorías y auditoría de movimientos.

## 🚀 Tecnologías Utilizadas
- **NestJS 11**: Framework de Node.js progresivo para aplicaciones eficientes.
- **TypeORM**: ORM para la interacción con la base de datos MySQL/MariaDB.
- **MySQL 8+**: Base de datos relacional para garantizar la integridad de los datos.
- **Passport & JWT**: Sistema de autenticación seguro basado en tokens.
- **Swagger**: Documentación interactiva de la API.
- **Class Validator**: Validación de datos de entrada en tiempo real.
- **Morgan**: Registro de peticiones HTTP para depuración.

## 📋 Características Principales
- **Arquitectura Modular**: Código organizado por módulos (Productos, Categorías, Inventario, Usuarios).
- **Semilla de Datos (Seed)**: Población automática de productos y categorías al iniciar por primera vez.
- **Logs de Auditoría**: Registro automático de cada cambio en el stock o precio de los productos.
- **Seguridad**: Protección de rutas mediante Guards y validación de esquemas.
- **BI Metrics**: Endpoints especializados para cálculos de salud del inventario.

## 🛠️ Configuración Local

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno**:
    Crea un archivo `.env` basado en `.env.example`:
    ```env
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_USERNAME=root
    DB_PASSWORD=
    DB_DATABASE=tienda_virtual
    JWT_SECRET=tu_clave_secreta
    ```
3.  **Ejecutar en modo desarrollo**:
    ```bash
    npm run start:dev
    ```

## 📖 Documentación de la API
Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva (Swagger) en:
[http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---
Desarrollado para la asignatura de **Electiva III**.
