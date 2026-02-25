import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { IMailer, SendMailOptions } from './mailer.interface';

@Injectable()
export class ConsoleMailerService implements IMailer {
  constructor(
    @InjectPinoLogger(ConsoleMailerService.name)
    private readonly logger: PinoLogger,
  ) {}

  async send(options: SendMailOptions): Promise<void> {
    this.logger.info(
      { to: options.to, subject: options.subject },
      `[MAIL] To: ${options.to} | Subject: ${options.subject}`,
    );
    this.logger.debug({ body: options.body }, '[MAIL] Body content');
  }
}
