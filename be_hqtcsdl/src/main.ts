import { Application } from 'express';
import { AppModule } from './app.module';
import { database } from './infra/database';
import { redisClient } from './infra/cache';
import { config } from './config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

async function bootstrap() {
  // Connect to database
  await database.connect();

  // Connect to Redis (non-blocking)
  await redisClient.connect();

  // Create Express app
  const app: Application = await AppModule.create();
  const PORT = config.app.port;

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📄 Swagger docs available at http://localhost:${config.app.port}/api-docs`);

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${config.app.env}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await database.close();
    await redisClient.disconnect();
    process.exit(0);
  });
}

bootstrap();
