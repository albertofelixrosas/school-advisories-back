import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { validationSchema } from './env.validation';

import { Subject } from './subjects/entities/subject.entity';
import { Advisory } from './advisories/entities/advisory.entity';
import { AdvisoryDate } from './advisory-dates/entities/advisory-date.entity';
import { AdvisorySchedule } from './advisory-schedules/entities/advisory-schedule.entity';
import { Venue } from './venues/entities/venue.entity';
import { User } from './users/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { SubjectDetails } from './subject-details/entities/subject-detail.entity';
import { SubjectSchedule } from './subject-schedules/entities/subject-schedule.entity';

import { SubjectDetailsModule } from './subject-details/subject-details.module';
import { SubjectSchedulesModule } from './subject-schedules/subject-schedules.module';
import { AdvisoriesModule } from './advisories/advisories.module';
import { AdvisoryDatesModule } from './advisory-dates/advisory-dates.module';
import { AdvisorySchedulesModule } from './advisory-schedules/advisory-schedules.module';
import { VenuesModule } from './venues/venues.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdvisoryAttendanceModule } from './advisory-attendance/advisory-attendance.module';
import { AdvisoryAttendance } from './advisory-attendance/entities/advisory-attendance.entity';
import { QueueModule } from './queue/queue.module';
import { EmailModule } from './email/email.module';
import { AdvisoryRequest } from './advisory-requests/entities/advisory-request.entity';
import { NotificationPreferences } from './notifications/entities/notification-preferences.entity';
import { NotificationLogs } from './notifications/entities/notification-logs.entity';
import { EmailTemplates } from './notifications/entities/email-templates.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // hace que ConfigService esté disponible globalmente
      validationSchema,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
    }),

    // Configuración de Schedule para Cron Jobs
    ScheduleModule.forRoot(),

    // Configuración de Colas
    QueueModule,

    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'docs'),
          serveRoot: '/docs', // accesible en http://localhost:3000/docs
        }),
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          RefreshToken,
          Subject,
          SubjectDetails,
          SubjectSchedule,
          Advisory,
          AdvisoryDate,
          AdvisorySchedule,
          AdvisoryAttendance,
          Venue,
          // Nuevas entidades
          AdvisoryRequest,
          NotificationPreferences,
          NotificationLogs,
          EmailTemplates,
        ],
        synchronize: true, // solo para desarrollo
      }),
    }),
    UsersModule,
    AuthModule,
    SubjectsModule,
    SubjectDetailsModule,
    SubjectSchedulesModule,
    AdvisoriesModule,
    AdvisoryDatesModule,
    AdvisorySchedulesModule,
    AdvisoryAttendanceModule,
    VenuesModule,

    // Nuevos módulos
    EmailModule,
  ],
})
export class AppModule {}
