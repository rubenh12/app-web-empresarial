import { z } from 'zod';

const BaseTaskSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional().nullable(),
  priority: z.enum(['baja', 'media', 'alta']).default('media'),
  status: z.enum(['pendiente', 'en_progreso', 'completado', 'bloqueado']).default('pendiente'),
  projectId: z.string().min(1, 'Debe seleccionar un proyecto'),
  userId: z.string().min(1, 'Debe asignar un responsable'),
  startDate: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.coerce.date().optional()),
  endDate: z.preprocess((val) => (val === '' || val === null ? null : val), z.coerce.date().optional().nullable()),
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
  startDate?: string | Date;
  endDate?: string | Date;
}

export class UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: 'baja' | 'media' | 'alta';
  status?: 'pendiente' | 'en_progreso' | 'completado' | 'bloqueado';
  projectId?: string;
  userId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}
