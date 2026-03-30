import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { RoleName, PermissionSlug } from '../src/common/enums/rbac.enum.ts'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const permissions = [
    { slug: PermissionSlug.VER_USUARIOS, name: 'Ver listado de usuarios' },
    { slug: PermissionSlug.CREAR_USUARIOS, name: 'Agregar nuevos usuarios' },
    { slug: PermissionSlug.ACTUALIZAR_USUARIOS, name: 'Editar usuarios existentes' },
    { slug: PermissionSlug.ELIMINAR_USUARIOS, name: 'Eliminar usuarios del sistema' },
    { slug: PermissionSlug.VER_CLIENTES, name: 'Ver listado de clientes' },
    { slug: PermissionSlug.CREAR_CLIENTES, name: 'Agregar nuevos clientes' },
    { slug: PermissionSlug.ACTUALIZAR_CLIENTES, name: 'Editar clientes existentes' },
    { slug: PermissionSlug.ELIMINAR_CLIENTES, name: 'Eliminar clientes del sistema' },
    { slug: PermissionSlug.VER_PROYECTOS, name: 'Ver listado de proyectos' },
    { slug: PermissionSlug.VER_PROYECTOS_ASIGNADOS, name: 'Ver proyectos asignados' },
    { slug: PermissionSlug.CREAR_PROYECTOS, name: 'Agregar nuevos proyectos' },
    { slug: PermissionSlug.ACTUALIZAR_PROYECTOS, name: 'Editar proyectos existentes' },
    { slug: PermissionSlug.ELIMINAR_PROYECTOS, name: 'Eliminar proyectos del sistema' },
    { slug: PermissionSlug.VER_TAREAS, name: 'Ver listado de tareas' },
    { slug: PermissionSlug.CREAR_TAREAS, name: 'Agregar nuevas tareas' },
    { slug: PermissionSlug.ACTUALIZAR_TAREAS, name: 'Editar tareas existentes' },
    { slug: PermissionSlug.ELIMINAR_TAREAS, name: 'Eliminar tareas del sistema' },
  ]

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
  }

  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {
      permissions: {
        set: permissions.map(p => ({ slug: p.slug })),
      },
    },
    create: {
      name: RoleName.ADMIN,
      description: 'Administrador con acceso total',
      permissions: {
        connect: permissions.map(p => ({ slug: p.slug })),
      },
    },
  })

  await prisma.role.upsert({
    where: { name: RoleName.USUARIO },
    update: {
      permissions: {
        set: [
          { slug: PermissionSlug.VER_USUARIOS },
          { slug: PermissionSlug.VER_PROYECTOS_ASIGNADOS },
          { slug: PermissionSlug.VER_TAREAS },
          { slug: PermissionSlug.ACTUALIZAR_TAREAS },
        ],
      },
    },
    create: {
      name: RoleName.USUARIO,
      description: 'Usuario con acceso limitado',
      permissions: {
        connect: [
          { slug: PermissionSlug.VER_USUARIOS },
          { slug: PermissionSlug.VER_PROYECTOS_ASIGNADOS },
          { slug: PermissionSlug.VER_TAREAS },
          { slug: PermissionSlug.ACTUALIZAR_TAREAS },
        ],
      },
    },
  })

  const hashedPassword = await bcrypt.hash('12345678', 10)

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Administrador Principal',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  })

  console.log('SEED COMPLETADO')
  console.log('Login: admin@gmail.com / 12345678')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })