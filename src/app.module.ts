import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { AdvisoriesModule } from './advisories/advisories.module';
import { LocationsModule } from './locations/locations.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { validationSchema } from './env.validation';

import { Teacher } from './teachers/entities/teacher.entity';
import { Student } from './students/entities/student.entity';
import { Subject } from './subjects/entities/subject.entity';
import { Advisory } from './advisories/entities/advisory.entity';
import { Location } from './locations/entities/location.entity';
import { User } from './users/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // hace que ConfigService esté disponible globalmente
      validationSchema,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          Student,
          Teacher,
          Subject,
          Advisory,
          Location,
          User,
          RefreshToken,
        ],
        synchronize: true, // solo para desarrollo
      }),
    }),

    TeachersModule,
    StudentsModule,
    AdvisoriesModule,
    LocationsModule,
    SubjectsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
