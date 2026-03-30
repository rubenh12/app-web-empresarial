# Sistema de Gestión Empresarial

Aplicación full-stack para gestión empresarial, organizada como monorepo con una API REST en NestJS y un frontend en Angular. El sistema administra usuarios, clientes, proyectos, tareas y roles con control de permisos detallado.

**URLs de producción**

- Frontend: https://app-web-empresarial.vercel.app/login
- Backend API: https://app-web-empresarial.onrender.com
- Base de datos: Neon (PostgreSQL serverless)

---

## Stack

**Backend** — `/servidor`

- NestJS (framework de Node.js)
- Prisma ORM con PostgreSQL (Neon)
- JWT para autenticación (access token + refresh token)
- Zod para validación de solicitudes
- Estrategias Passport.js (JWT AT / RT)
- pnpm

**Frontend** — `/cliente`

- Angular 18+ (componentes standalone, signals)
- Angular Material
- Tailwind CSS
- npm

---

## Arquitectura del Backend

El backend sigue la arquitectura modular de NestJS. Cada recurso está aislado en su propio módulo con su propio controlador, servicio y esquema de validación.

### Módulos

- `AuthModule` — Endpoints de login, logout y refresco de token. Emite JWTs y gestiona la rotación de refresh tokens.
- `UsersModule` — CRUD de usuarios del sistema. Incluye asignación de roles.
- `ClientsModule` — CRUD de clientes.
- `ProjectsModule` — CRUD de proyectos, asociados a clientes y usuarios.
- `TasksModule` — CRUD de tareas, vinculadas a proyectos y responsables.
- `RolesModule` — Gestión de roles y sus permisos asociados.
- `PrismaModule` — Servicio singleton global que encapsula el cliente de Prisma, inyectado en todos los módulos.

### Common

Ubicado en `src/common/`, contiene piezas compartidas utilizadas en todos los módulos:

- **Guards**
  - `AtGuard` — Protege rutas que requieren un access token válido.
  - `RtGuard` — Usado exclusivamente en el endpoint de refresco, valida refresh tokens.
  - `PermissionsGuard` — Verifica que el usuario autenticado posea los permisos requeridos, declarados mediante el decorador `@Permissions()`.
- **Strategies** (`src/common/strategies/`)
  - `AtStrategy` — Estrategia Passport que valida el JWT de acceso y carga el payload del usuario.
  - `RtStrategy` — Estrategia Passport que valida el JWT de refresco.
- **Decorators** (`src/common/decorators/`)
  - `@Permissions(...slugs)` — Agrega los permisos requeridos a un handler de ruta como metadata, consumida por `PermissionsGuard`.
- **Pipes** (`src/common/pipes/`)
  - `ZodPipe` — Pipe de validación genérico. Recibe un esquema Zod y valida/transforma el body de la solicitud antes de que llegue al controlador.
- **Middleware** (`src/common/middleware/`)
  - `JsonBodyMiddleware` — Asegura que el body de la solicitud se parsee como JSON. Aplicado globalmente en `AppModule`.
- **Enums** (`src/common/enums/`)
  - `rbac.enum.ts` — Define las constantes `RoleName` y `PermissionSlug` usadas en el backend y en el seed de Prisma.

### Flujo de autenticación

1. `POST /auth/login` — Valida credenciales y devuelve `access_token` y `refresh_token`.
2. Todas las rutas protegidas requieren el header `Authorization: Bearer <access_token>`, aplicado por `AtGuard`.
3. `POST /auth/refresh` — Requiere un `refresh_token` válido y emite un nuevo par de tokens.
4. `POST /auth/logout` — Invalida el refresh token en el servidor.

### Control de acceso (RBAC)

Los roles se almacenan en la base de datos y están vinculados a un conjunto de permisos mediante una relación muchos a muchos. Cada ruta que requiere un permiso específico se decora con `@Permissions(PermissionSlug.X)`. El `PermissionsGuard` lee los permisos del rol del usuario desde el payload del JWT y los compara contra los slugs requeridos. Si la verificación falla, la solicitud es rechazada con 403.

### Base de datos y Seed

El esquema de base de datos se gestiona con Prisma. El script de seed (`prisma/seed.ts`) se ejecuta con `tsx` y crea los roles iniciales (`ADMIN`, `USUARIO`) con sus permisos, y genera un usuario administrador por defecto.

```bash
npx prisma migrate deploy   # aplicar migraciones en producción
npx prisma db seed          # ejecutar el seed
```

---

## Arquitectura del Frontend

La aplicación Angular usa componentes standalone y rutas con carga diferida (lazy loading).

### Páginas / Módulos por funcionalidad

- `login/` — Página de autenticación.
- `dashboard/` — Vista principal al iniciar sesión.
- `users/` — Gestión de usuarios.
- `clients/` — Gestión de clientes.
- `projects/` — Gestión de proyectos.
- `tasks/` — Gestión de tareas.
- `roles/` — Gestión de roles y permisos.

### Core

Ubicado en `src/app/core/`, contiene código de infraestructura compartido en toda la aplicación:

- **Servicios** (`core/services/`)
  - `AuthService` — Gestiona el login, logout, almacenamiento de tokens y el estado de sesión.
  - `UsersService`, `ClientsService`, `ProjectsService`, `TasksService`, `RolesService` — Servicios HTTP para cada recurso, encapsulan el `HttpClient` de Angular.
  - `ToastService` — Servicio centralizado de notificaciones para el feedback al usuario.
- **Interceptors** (`core/interceptors/`)
  - `AuthInterceptor` — Adjunta el access token a cada solicitud HTTP saliente. Maneja respuestas 401 intentando un refresco de token; si el refresco también falla, cierra la sesión del usuario y lo redirige al login.
- **Guards** (`core/guards/`)
  - Protegen la navegación del lado del cliente para usuarios no autenticados o sin autorización.

---

## Estructura del proyecto

```
app-web-empresarial/
├── servidor/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── auth/
│       ├── clients/
│       ├── common/
│       │   ├── decorators/
│       │   ├── enums/
│       │   ├── guards/
│       │   ├── middleware/
│       │   ├── pipes/
│       │   └── strategies/
│       ├── prisma/
│       ├── projects/
│       ├── roles/
│       ├── tasks/
│       └── users/
├── cliente/
│   └── src/
│       └── app/
│           ├── core/
│           │   ├── guards/
│           │   ├── interceptors/
│           │   └── services/
│           ├── dashboard/
│           ├── clients/
│           ├── layout/
│           ├── login/
│           ├── projects/
│           ├── roles/
│           ├── shared/
│           ├── tasks/
│           └── users/
└── README.md
```

---

## Variables de entorno

**Backend** (`servidor/.env`)

```env
DATABASE_URL="postgresql://usuario:password@host/db?sslmode=require"
JWT_AT_SECRET="secreto_de_access_token"
JWT_RT_SECRET="secreto_de_refresh_token"
PORT=3000
```

**Frontend** (`cliente/.env`)

```env
VITE_API_URL=https://app-web-empresarial.onrender.com
```

---

## Comandos

**Backend**

```bash
cd servidor
pnpm install
pnpm dev            # desarrollo con modo watch
pnpm build          # build de producción
pnpm start:prod     # ejecutar el build compilado
```

**Frontend**

```bash
cd cliente
npm install
npm run build       # build para producción (salida: dist/cliente)
```
