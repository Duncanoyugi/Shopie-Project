import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as ejs from 'ejs';
import * as fs from 'fs';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: +(this.configService.get<number>('MAIL_PORT') ?? 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any>,
  ) {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'mail',
      'templates',
      `${templateName}.ejs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    const html = await ejs.renderFile(templatePath, context);

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject,
      html,
    });
  }

  async sendUserWelcome(to: string, name: string) {
    return this.sendMail(to, 'Welcome to Shopie!', 'welcome', { name });
  }
  async sendPasswordReset(to: string, name: string, token: string) {
    const resetLink = `http://localhost:4200/reset-password?token=${token}`; // your frontend reset route
    return this.sendMail(to, 'Reset Your Password', 'reset-password', {
      name,
      resetLink,
    });
  }
  async sendPasswordResetSuccess(to: string, name: string) {
    return this.sendMail(
      to,
      'Your Shopie Password Was Changed',
      'password-reset-success',
      { name },
    );
  }
}
