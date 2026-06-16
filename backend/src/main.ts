if (!global.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cryptoModule = require('crypto') as { webcrypto: unknown };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  global.crypto = cryptoModule.webcrypto as any;
}
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  // ========================================
  // Endpoint de salud PRIMERO (antes de seguridad)
  // ========================================
  const httpAdapter = app.getHttpAdapter();

  httpAdapter.get('/health', (req: any, res: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ========================================
  // Helmet (seguridad)
  // ========================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: [
            "'self'",
            'data:',
            'https://images.unsplash.com',
            'https://*.unsplash.com',
          ],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", 'http://localhost:5175'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
      crossOriginEmbedderPolicy: { policy: 'require-corp' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
    }),
  );

  // ========================================
  // CORS seguro con .filter(Boolean)
  // ========================================
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(cookieParser());
  app.use(morgan('dev'));

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.log('=== VALIDATION ERROR ===');
        console.log('Errors:', errors);
        console.log('========================');
        return errors;
      },
    }),
  );
  // Habilitar ClassSerializerInterceptor para excluir datos sensibles
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Backend2026')
      .setDescription(
        'Documentación Swagger para estudiantes (productos, categorías, inventario)',
      )
      .setVersion('1.0')
      .addTag('productos')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
