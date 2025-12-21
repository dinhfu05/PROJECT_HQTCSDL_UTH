import { Application } from 'express';
import { AppModule } from './app.module';
import { database } from './infra/database';
import { config } from './config';

async function bootstrap() {
  // Connect to database
  await database.connect();

  // Create Express app
  const app: Application = await AppModule.create();
  const PORT = config.app.port;

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${config.app.env}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await database.close();
    process.exit(0);
  });
}

bootstrap();
