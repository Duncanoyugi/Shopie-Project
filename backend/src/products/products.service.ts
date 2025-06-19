import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        shortDescription: dto.shortDescription,
        description: dto.description,
        price: dto.price.toString(),
        imageUrl: dto.imageUrl,
        stockQuantity: dto.stockQuantity,
        category: dto.category,
        tags: dto.tags,
      },
    });

    return {
      message: 'Item created successfully.',
      product,
    };
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.product.update({
      where: { id },
      data: dto,
    });

    return { message: 'Item updated successfully.' };
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.product.delete({ where: { id } });

    return { message: 'Item deleted successfully.' };
  }

  async getAllProducts() {
    return this.prisma.product.findMany();
  }

  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async searchProducts(name: string) {
    console.log('Incoming search query:', name);

    const results = await this.prisma.product.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' },
      },
    });

    console.log(`Found ${results.length} item(s) for "${name}"`);

    if (results.length === 0) {
      return { message: 'No items matched your search.' };
    }

    return results;
  }
}
