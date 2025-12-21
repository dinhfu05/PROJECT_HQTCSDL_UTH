import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules';
import { errorMiddleware, loggerMiddleware } from './common/middleware';

dotenv.config();

export class AppModule {
  private static app: Application;
  private static appController: AppController;
  private static appService: AppService;
  private static usersModule: UsersModule;

  static async create(): Promise<Application> {
    this.app = express();

    // Global Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(loggerMiddleware);

    // Initialize services and controllers
    this.appService = new AppService();
    this.appController = new AppController(this.appService);

    // Initialize modules
    this.usersModule = new UsersModule();

    // Register routes
    this.registerRoutes();

    // Error handling middleware (must be last)
    this.app.use(errorMiddleware);

    return this.app;
  }

  private static registerRoutes(): void {
    // App routes
    this.app.get('/', this.appController.getHello.bind(this.appController));
    this.app.get('/health', this.appController.getHealth.bind(this.appController));

    // Module routes
    this.app.use('/api/users', this.usersModule.router);
  }
}
