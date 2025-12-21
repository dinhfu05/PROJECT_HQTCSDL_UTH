import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (error instanceof HttpException) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  });
}
