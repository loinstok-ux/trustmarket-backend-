import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailOtpDto {
  @ApiProperty({ example: 'usuario@correo.com' })
  @IsEmail()
  email: string;
}
