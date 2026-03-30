import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as bcrypt from 'bcryptjs';
import { RoleName, PermissionSlug } from '../src/common/enums/rbac.enum.js';

const config = {
  url: 'file:./dev.db',
};
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  const permissions = [
    { slug: PermissionSlug.VER_USUARIOS, name: 'Ver listado de usuarios' },
    { slug: PermissionSlug.CREAR_USUARIOS, name: 'Agregar nuevos usuarios' },
    { slug: PermissionSlug.ACTUALIZAR_USUARIOS, name: 'Editar usuarios existentes' },
    { slug: PermissionSlug.ELIMINAR_USUARIOS, name: 'Eliminar usuarios del sistema' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
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
  });

  await prisma.role.upsert({
    where: { name: RoleName.USUARIO },
    update: {
      permissions: {
        set: [{ slug: PermissionSlug.VER_USUARIOS }],
      },
    },
    create: {
      name: RoleName.USUARIO,
      description: 'Usuario con acceso básico de lectura',
      permissions: {
        connect: [{ slug: PermissionSlug.VER_USUARIOS }],
      },
    },
  });

  const hashedPassword = await bcrypt.hash('12345678', 10);

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Administrador Principal',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('--- SEED COMPLETADO CON ÉXITO ---');
  console.log('Login: admin@gmail.com / 12345678');
  console.log('Roles definidos: ADMIN (Acceso Total), USUARIO (Solo Lectura)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
