import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL') || 'http://localhost:5173',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Quita propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanza error si vienen propiedades no permitidas
      forbidUnknownValues: true, // Asegura que los objetos no sean null o undefined
      transform: true, // Convierte tipos automáticamente (por ejemplo, de string a number)
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('School Advisories API')
    .setDescription(
      `<p>Esta es la documentación de la API de asesorías.</p>
  <p><strong>Diagrama Entidad-Relación:</strong></p>
  <img src="/docs/images/er-diagram-black.svg" alt="ER Diagram" width="100%"/>`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'jwt-auth', // nombre único
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const theme = new SwaggerTheme();
  const darkTheme = theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK);

  SwaggerModule.setup('api', app, document, {
    customCss: darkTheme,
  }); // http://localhost:<PORT>/api

  await app.listen(port);
  console.log(`🚀 Server running at http://localhost:${port}`);
}

bootstrap();
