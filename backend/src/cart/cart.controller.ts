import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
export class CartController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@CurrentUser() user: { id: string; email: string; role: string }) {
    return `Return cart for user with ID: ${user.id}`;
  }
}
