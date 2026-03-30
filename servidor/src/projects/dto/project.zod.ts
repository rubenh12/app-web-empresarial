import { z } from 'zod';

const BaseProjectSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  status: z.enum(['pendiente', 'en_progreso', 'completado', 'cancelado']).default('pendiente'),
  clientId: z.string().min(1, 'Debe seleccionar un cliente'),
});

const dateRefinement = {
  check: (data: any) => {
    if (!data.endDate || !data.startDate) return true;
    return new Date(data.endDate) >= new Date(data.startDate);
  },
  params: {
    message: 'La fecha de fin no puede ser anterior a la de inicio',
    path: ['endDate'],
  }
};

export const CreateProjectSchema = BaseProjectSchema.refine(dateRefinement.check, dateRefinement.params);

export const UpdateProjectSchema = BaseProjectSchema.partial().refine(dateRefinement.check, dateRefinement.params);

export class CreateProjectDto {
  name!: string;
  description?: string;
  startDate!: Date;
  endDate?: Date | null;
  status?: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  clientId!: string;
}

export class UpdateProjectDto {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date | null;
  status?: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  clientId?: string;
}
