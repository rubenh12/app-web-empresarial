import { z } from 'zod';

export const CreateClientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string()
    .regex(/^[0-9]*$/, 'El teléfono solo debe contener números')
    .length(8, 'El teléfono debe tener exactamente 8 dígitos')
    .optional(),
  company: z.string().optional(),
  status: z.enum(['activo', 'inactivo']).default('activo'),
});

export const UpdateClientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string()
    .regex(/^[0-9]*$/, 'El teléfono solo debe contener números')
    .length(8, 'El teléfono debe tener exactamente 8 dígitos')
    .optional(),
  company: z.string().optional(),
  status: z.enum(['activo', 'inactivo']).optional(),
});

export class CreateClientDto {
  name!: string;
  email!: string;
  phone?: string;
  company?: string;
  status?: 'activo' | 'inactivo';
}

export class UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: 'activo' | 'inactivo';
}
