import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

// Application bootstrap with security defaults and OpenAPI setup.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get<string[]>('corsOrigins', ['http://localhost:5173']),
    credentials: true
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get<string>('defaultApiVersion', '1')
  });

  app.setGlobalPrefix(configService.get<string>('apiPrefix', 'api'));

  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('Multi-tenant SaaS CRM API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(configService.get<number>('port', 3000));
}

bootstrap();
