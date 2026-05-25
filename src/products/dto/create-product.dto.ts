import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 13' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 450 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Buen estado' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Caracas' })
  @IsString()
  location: string;
}
