import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailOtpDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '483920' })
  @IsString()
  @Length(6, 6)
  code: string;
}
