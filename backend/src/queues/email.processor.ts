import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';

@Processor('email')
export class EmailProcessor {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  @Process('send-email')
  async handleSendEmail(job: Job) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { to, subject, text, html } = job.data;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@inventario.com',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        to,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        subject,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        text,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        html,
      });

      console.log(`Email enviado a ${to}: ${subject}`);
    } catch (error) {
      console.error(`Error enviando email a ${to}:`, error);
      throw error;
    }
  }
}
