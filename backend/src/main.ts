import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

// Application bootstrap with security defaults and OpenAPI setup.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();

  app.enableShutdownHooks();
  const trustProxyHops = configService.get<number>('trustProxyHops', 0);
  expressApp.set('trust proxy', trustProxyHops === 0 ? false : trustProxyHops);

  app.use(helmet());
  const requestBodyLimit = configService.get<string>('requestBodyLimit', '100kb');
  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: false, limit: requestBodyLimit, parameterLimit: 1000 }));
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get<string[]>('corsOrigins', ['http://localhost:5173']),
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 600
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
  app.useGlobalFilters(new HttpExceptionFilter());

  if (configService.get<boolean>('swaggerEnabled', false)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CRM API')
      .setDescription('Multi-tenant SaaS CRM API')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/api/docs', app, document);
  }

  await app.listen(configService.get<number>('port', 3000), '0.0.0.0');
}

bootstrap();
