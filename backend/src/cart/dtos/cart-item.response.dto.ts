import { Product } from "@prisma/client";

export class CartItemResponseDto {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  AddedAt: Date;
  product?: Product;
}
