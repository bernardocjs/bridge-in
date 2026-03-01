import { Injectable, Logger } from '@nestjs/common';
import { IMailer, SendMailOptions } from './mailer.interface';

@Injectable()
export class ConsoleMailerService implements IMailer {
  private readonly logger = new Logger(ConsoleMailerService.name);

  async send(options: SendMailOptions): Promise<void> {
    this.logger.log(`[MAIL] To: ${options.to} | Subject: ${options.subject}`);
    this.logger.debug(`[MAIL] Body content: ${options.body}`);
  }
}
