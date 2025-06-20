import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
  ParamData,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartDto } from './dtos/update-cart.dto';
import { CartItemResponseDto } from './dtos/cart-item.response.dto';
import { ProductParamDto } from './dtos/product-param.dto';

interface RequestWithUser extends Request {
  user: { sub: string };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':productId')
  async addToCart(
    @Req() req: RequestWithUser,
    @Param() params: ProductParamDto,
    @Body() body: AddToCartDto,
  ): Promise<CartItemResponseDto> {
    const userId = req.user.sub;
    console.log('UserID:', userId);
    return this.cartService.addToCart(userId, params.productId, body.quantity);
  }

  @Get()
  async getCart(@Req() req: RequestWithUser): Promise<CartItemResponseDto[]> {
    const userId = req.user.sub;
    return this.cartService.getCart(userId);
  }

  @Patch(':productId')
  async updateCartItem(
    @Req() req: RequestWithUser,
    @Param() params: ProductParamDto, // Use the DTO
    @Body() body: UpdateCartDto,
  ): Promise<CartItemResponseDto> {
    const userId = req.user.sub;
    return this.cartService.updateCartItem(
      userId,
      params.productId,
      body.quantity,
    );
  }

  @Delete(':productId')
  async removeFromCart(
    @Req() req: RequestWithUser,
    @Param() params: ProductParamDto, // Use the DTO
  ): Promise<{ message: string }> {
    const userId = req.user.sub;
    return this.cartService.removeFromCart(userId, params.productId);
  }

  @Delete()
  async clearCart(@Req() req: RequestWithUser): Promise<{ message: string }> {
    const userId = req.user.sub;
    return this.cartService.clearCart(userId);
  }
}
