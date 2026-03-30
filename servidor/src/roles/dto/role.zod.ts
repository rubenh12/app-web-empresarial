import { z } from 'zod';

export const CreateRoleSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional().nullable(),
  permissionSlugs: z.array(z.string()).min(1, 'Debes seleccionar al menos un permiso'),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
