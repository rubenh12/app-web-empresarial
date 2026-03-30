import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) { }

  transform(value: unknown, metadata: ArgumentMetadata) {
    let parsedValue = value;
    if (typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
      }
    }

    try {
      const validatedValue = this.schema.parse(parsedValue);
      return validatedValue;
    } catch (error) {
      const zodError = error as any;
      let errorMessage = 'Error de validación';
      let details: any[] = [];

      if (zodError?.errors && Array.isArray(zodError.errors)) {
        details = zodError.errors;
        const fieldErrors = zodError.errors.map((err: any) => {
          const field = err.path?.[0] || 'campo';
          const message = err.message || 'Valor inválido';
          return `${field}: ${message}`;
        });
        errorMessage = fieldErrors.join(', ');
      } else if (zodError?.issues && Array.isArray(zodError.issues)) {
        details = zodError.issues;
        const fieldErrors = zodError.issues.map((err: any) => {
          const field = err.path?.[0] || 'campo';
          const message = err.message || 'Valor inválido';
          return `${field}: ${message}`;
        });
        errorMessage = fieldErrors.join(', ');
      }

      const response = {
        message: errorMessage,
        error: 'Bad Request',
        statusCode: 400,
        details: details
      };

      throw new BadRequestException(response);
    }
  }
}
