import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '+58 412 1234567' })
  @IsOptional()
  phone?: string;
}
