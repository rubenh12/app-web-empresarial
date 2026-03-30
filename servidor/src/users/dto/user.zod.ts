import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roleId: z.string().cuid('ID de rol inválido'),
});

export const UpdateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  roleId: z.string().cuid('ID de rol inválido').optional(),
});

export class CreateUserDto {
  email!: string;
  name!: string;
  password!: string;
  roleId!: string;
}

export class UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  roleId?: string;
}
