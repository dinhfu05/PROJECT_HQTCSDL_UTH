import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // ANSI Color Codes
    const reset = '\x1b[0m';
    let color = reset;

    if (statusCode >= 500) color = '\x1b[31m'; // Red
    else if (statusCode >= 400) color = '\x1b[33m'; // Yellow
    else if (statusCode >= 300) color = '\x1b[36m'; // Cyan
    else if (statusCode >= 200) color = '\x1b[32m'; // Green

    console.log(
      `${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms${reset}`,
    );
  });

  next();
}
