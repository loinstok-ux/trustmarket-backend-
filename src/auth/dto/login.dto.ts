import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  password: string;
}
