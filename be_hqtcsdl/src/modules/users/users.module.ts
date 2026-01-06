import { Router } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

export class UsersModule {
  public router: Router;
  private usersController: UsersController;
  private usersService: UsersService;

  constructor() {
    this.router = Router();
    this.usersService = new UsersService();
    this.usersController = new UsersController(this.usersService);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.usersController.findAll);
    this.router.get('/:id', this.usersController.findOne);
    this.router.post('/', this.usersController.create);
    this.router.patch('/:id', this.usersController.update);
    this.router.delete('/:id', this.usersController.remove);
  }
}

export * from './users.controller';
export * from './users.service';
