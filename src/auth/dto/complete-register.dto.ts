import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteRegisterDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiContrasena123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  name?: string;
}
