import { z } from 'zod';

const BaseTaskSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  priority: z.enum(['baja', 'media', 'alta']).default('media'),
  status: z.enum(['pendiente', 'en_progreso', 'completado', 'bloqueado']).default('pendiente'),
  projectId: z.string().min(1, 'Debe seleccionar un proyecto'),
  userId: z.string().min(1, 'Debe asignar un responsable'),
});

export const CreateTaskSchema = BaseTaskSchema;
export const UpdateTaskSchema = BaseTaskSchema.partial();

export class CreateTaskDto {
  title!: string;
  description?: string;
  priority?: 'baja' | 'media' | 'alta';
  status?: 'pendiente' | 'en_progreso' | 'completado' | 'bloqueado';
  projectId!: string;
  userId!: string;
}

export class UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: 'baja' | 'media' | 'alta';
  status?: 'pendiente' | 'en_progreso' | 'completado' | 'bloqueado';
  projectId?: string;
  userId?: string;
}
