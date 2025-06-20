/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CartItemResponseDto } from './dtos/cart-item.response.dto';
import { CartItem, Product } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItemResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    let cartItem;
    if (existing) {
      cartItem = await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          totalPrice: new Decimal(product.price).mul(
            existing.quantity + quantity,
          ),
        },
        include: { product: true },
      });
    } else {
      cartItem = await this.prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
          totalPrice: new Decimal(product.price).mul(quantity),
        },
        include: { product: true },
      });
    }

    return this.toResponseDto(cartItem);
  }

  async updateCartItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItemResponseDto> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity,
        totalPrice: new Decimal(cartItem.product.price).mul(quantity),
      },
      include: { product: true },
    });

    return this.toResponseDto(updated);
  }

  async getCart(userId: string): Promise<CartItemResponseDto[]> {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    return items.map((item) => this.toResponseDto(item));
  }

  async removeFromCart(
    userId: string,
    productId: string,
  ): Promise<{ message: string }> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (!cartItem) throw new NotFoundException('Item not found in cart');

    await this.prisma.cartItem.delete({ where: { id: cartItem.id } });

    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { message: 'Cart cleared' };
  }

  private toResponseDto(
    item: CartItem & { product: Product },
  ): CartItemResponseDto {
    return {
      id: item.id,
      productName: item.product.name,
      productImage: item.product.imageUrl,
      quantity: item.quantity,
      totalPrice: parseFloat(item.totalPrice.toString()),
      AddedAt: item.addedAt,
      product: item.product,
    };
  }
}
