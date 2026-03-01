import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface MailRecipient {
  email: string;
  name?: string | null;
}

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly baseUrl: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.getOrThrow<string>('app.mail.apiKey'));
    this.from = this.config.getOrThrow<string>('app.mail.from');
    this.baseUrl = this.config.getOrThrow<string>('app.corsOrigin');
  }

  /**
   * Sends a new-report notification to all approved company members.
   * Fire-and-forget: does NOT throw — errors are only logged.
   */
  sendNewReportNotification(
    companyName: string,
    reportTitle: string,
    recipients: MailRecipient[],
  ): void {
    if (!recipients.length) return;

    const dashboardUrl = `${this.baseUrl}/dashboard/reports`;

    const html = this.buildNewReportHtml(
      companyName,
      reportTitle,
      dashboardUrl,
    );

    this.resend.emails
      .send({
        from: this.from,
        to: recipients.map((r) => r.email),
        subject: `[Bridge-In] Novo relatório recebido — ${companyName}`,
        html,
      })
      .then(() => {
        this.logger.log(
          `New-report notification sent to ${recipients.length} recipient(s) for company "${companyName}"`,
        );
      })
      .catch((err: unknown) => {
        this.logger.error(
          `Failed to send new-report notification for company "${companyName}"`,
          err,
        );
      });
  }

  private buildNewReportHtml(
    companyName: string,
    reportTitle: string,
    dashboardUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo relatório recebido</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:24px 32px;">
              <span style="color:#ffffff;font-size:22px;font-weight:700;">Bridge-In</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:20px;color:#18181b;">Novo relatório recebido</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;">
                A empresa <strong>${companyName}</strong> recebeu um novo relatório anônimo.
              </p>

              <table width="100%" cellpadding="16" cellspacing="0" style="background:#f4f4f5;border-radius:6px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:.05em;">Título do relatório</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#18181b;">${reportTitle}</p>
                  </td>
                </tr>
              </table>

              <a href="${dashboardUrl}"
                 style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
                Ver no dashboard
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Você recebe este email por ser membro aprovado da empresa ${companyName} no Bridge-In.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  }
}
