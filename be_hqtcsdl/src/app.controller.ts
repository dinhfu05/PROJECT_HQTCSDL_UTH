import { Request, Response } from 'express';
import { AppService } from './app.service';

export class AppController {
  constructor(private readonly appService: AppService) {}

  getHello(req: Request, res: Response): void {
    const result = this.appService.getHello();
    res.json(result);
  }

  getHealth(req: Request, res: Response): void {
    const result = this.appService.getHealth();
    res.json(result);
  }
}
