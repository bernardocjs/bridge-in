import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './providers/database/database.module';
import { MailerModule } from './providers/mailer/mailer.module';
import { AuthModule } from './resources/auth/auth.module';
import { CompanyModule } from './resources/company/company.module';
import { ReportModule } from './resources/report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    DatabaseModule,
    MailerModule,
    AuthModule,
    CompanyModule,
    ReportModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
