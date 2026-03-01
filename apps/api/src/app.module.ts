import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { appConfig, envValidationSchema } from './common/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './providers/database/database.module';
import { AuthModule } from './resources/auth/auth.module';
import { CompanyModule } from './resources/company/company.module';
import { ReportModule } from './resources/report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 60 }],
    }),
    LoggerModule,
    DatabaseModule,
    AuthModule,
    CompanyModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule {}
