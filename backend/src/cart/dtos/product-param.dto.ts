import { IsUUID } from 'class-validator';

export class ProductParamDto {
  @IsUUID()
  productId: string;
}
