export const MAILER_SERVICE = Symbol('MAILER_SERVICE');

export interface SendMailOptions {
  to: string;
  subject: string;
  body: string;
}

export interface IMailer {
  /** Sends an email. Implementations may be sync (console) or async (SES, SendGrid). */
  send(options: SendMailOptions): Promise<void>;
}
