import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Middleware - Método:', req.method, 'URL:', req.url);
    console.log('Middleware - Content-Type:', req.headers['content-type']);
    console.log('Middleware - Body raw:', req.body, typeof req.body);

    if (typeof req.body === 'string' && req.body.length > 0) {
      try {
        req.body = JSON.parse(req.body);
        console.log('Middleware - Body parseado:', req.body);
      } catch (e) {
        console.log('Middleware - Error parseando:', e);
      }
    }

    next();
  }
}
