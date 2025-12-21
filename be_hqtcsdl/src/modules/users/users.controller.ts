import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  findAll = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const users = this.usersService.findAll();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };

  findOne = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = this.usersService.findOne(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  create = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = this.usersService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = this.usersService.update(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  remove = (req: Request, res: Response, next: NextFunction): void => {
    try {
      this.usersService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
