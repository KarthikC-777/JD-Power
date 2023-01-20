import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './handlers/all-exceptions.filter';
import { logger } from './config/logger'
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger,
    cors: true,
  });
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  await app.listen(3000);
}
bootstrap();

