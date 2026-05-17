# Auth Service - Microservicio de Autenticación

Microservicio de autenticación para la plataforma de movilidad personalizada.

## Tecnologías

- **Backend**: NestJS
- **Base de datos**: MongoDB
- **Autenticación**: JWT + bcrypt

## Installation

```bash
npm install
```

## Configuración

Crear archivo `.env` basado en `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/auth-service
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
RECOVERY_TOKEN_EXPIRATION=15
PORT=3000
```

## Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/recovery` - Solicitar recuperación de contraseña
- `POST /api/v1/auth/reset` - Restablecer contraseña

### Users
- `GET /api/v1/users/profile` - Obtener perfil
- `PATCH /api/v1/users/profile` - Actualizar perfil
- `POST /api/v1/users/documents` - Subir documento
- `GET /api/v1/users/documents` - Listar documentos
- `PATCH /api/v1/users/availability` - Cambiar disponibilidad
- `GET /api/v1/users/availability` - Ver disponibilidad

### Admin
- `GET /api/v1/admin/drivers/pending` - Listar conductores pendientes
- `GET /api/v1/admin/documents/pending` - Listar documentos pendientes
- `POST /api/v1/admin/documents/:id/review` - Revisar documento