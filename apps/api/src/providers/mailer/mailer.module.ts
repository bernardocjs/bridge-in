import { Global, Module } from '@nestjs/common';
import { ConsoleMailerService } from './console-mailer.service';
import { MAILER_SERVICE } from './mailer.interface';

@Global()
@Module({
  providers: [
    {
      provide: MAILER_SERVICE,
      useClass: ConsoleMailerService,
    },
  ],
  exports: [MAILER_SERVICE],
})
export class MailerModule {}
