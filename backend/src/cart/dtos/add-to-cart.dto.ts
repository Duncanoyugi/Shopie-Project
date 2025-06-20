import { IsString, IsUUID, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
