# 🚀 Sistema de Gestión Empresarial - Proyecto Universitario

¡Hola! Este es mi proyecto de gestión empresarial. Lo hice usando un stack moderno con **NestJS** para el servidor y **Angular** para la interfaz. Está diseñado para ser escalable, seguro y fácil de desplegar en diferentes servidores (VPS).

---

## 🛠️ ¿Qué usé para armarlo?

### Servidor (Backend)
*   **NestJS:** El motor principal del API.
*   **Prisma ORM:** Para manejar la base de datos (actualmente configurado para PostgreSQL).
*   **JWT:** Para que el login sea seguro con tokens de acceso y refresco.
*   **Zod:** Para asegurar que los datos que entran sean correctos.

### Cliente (Frontend)
*   **Angular 18+:** Con las últimas funciones como **Signals**.
*   **Tailwind CSS:** Para que se vea premium y sea totalmente responsive (se ve bien en el cel).
*   **Vite:** Para que el desarrollo sea súper rápido.

---

## 🔑 Seguridad y Permisos
El sistema usa **RBAC** (Control de Acceso Basado en Roles). 
*   **Protección Total:** Si intentas entrar a una parte donde no tienes permiso, el sistema te saca automáticamente y te manda al login.
*   **Interceptor:** El frontend maneja los tokens y los errores 401/403 de forma automática.

---

## 🚀 ¿Cómo desplegarlo? (Rápido y Fácil)

Como lo vamos a subir en VPS diferentes, hay que configurar los archivos `.env` en cada carpeta:

### 1. En el VPS del Servidor
Crea un archivo `.env` dentro de la carpeta `/servidor`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/tu_db"
JWT_AT_SECRET="un_secreto_largo_y_seguro"
JWT_RT_SECRET="otro_secreto_para_el_refresh"
PORT=3000
```
Para migrar a PostgreSQL:
1.  En `prisma/schema.prisma`, cambia el provider a `"postgresql"`.
2.  Corre `npx prisma generate` y luego `npx prisma migrate dev`.

### 2. En Vercel o VPS del Cliente
Crea un archivo `.env` dentro de la carpeta `/cliente`:
```env
VITE_API_URL=https://tu-api-servidor.com
```
*Ya dejé listo el `vercel.json` para que el routing de Angular funcione perfecto en Vercel.*

---

## 🧼 Limpieza
He borrado las carpetas de `environments` que crea Angular por defecto para usar directamente el `.env` con Vite, así es más fácil de configurar para el despliegue final.

---
*Hecho con ❤️ por un estudiante buscando aprender las mejores prácticas.*
