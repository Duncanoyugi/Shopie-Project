import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test')
  async testMail(@Query('to') to: string, @Query('name') name: string) {
    try {
      await this.mailService.sendUserWelcome(to, name || 'Test User');
      return { message: 'Test email sent' };
    } catch (err) {
      console.error('❌ Email send failed:', err); // <== log the real error
      return {
        message: 'Failed to send email',
        error: err?.message || 'Unknown error',
      };
    }
  }
}
