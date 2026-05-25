import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { CompleteRegisterDto } from './dto/complete-register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── OTP Email Flow ────────────────────────────────────────────────────────────

  @Post('send-email-otp')
  @ApiOperation({ summary: 'Enviar código OTP al correo electrónico' })
  sendEmailOtp(@Body() dto: SendEmailOtpDto) {
    return this.authService.sendEmailOtp(dto.email);
  }

  @Post('verify-email-otp')
  @ApiOperation({ summary: 'Verificar código OTP del correo' })
  verifyEmailOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(dto.email, dto.code);
  }

  // ── Register (after email OTP verified) ───────────────────────────────────────

  @Post('complete-register')
  @ApiOperation({ summary: 'Completar registro (después de verificar OTP)' })
  completeRegister(@Body() dto: CompleteRegisterDto) {
    return this.authService.completeRegister(dto);
  }

  // ── Login via OTP ─────────────────────────────────────────────────────────────

  @Post('login-otp')
  @ApiOperation({ summary: 'Login: verificar OTP y obtener JWT' })
  loginWithOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.loginWithOtp(dto.email, dto.code);
  }

  // ── Phone ─────────────────────────────────────────────────────────────────────

  @Patch(':id/phone')
  @ApiOperation({ summary: 'Guardar número de teléfono del usuario' })
  updatePhone(@Param('id') id: string, @Body('phone') phone: string) {
    return this.authService.updatePhone(id, phone);
  }

  // ── KYC ───────────────────────────────────────────────────────────────────────

  @Patch(':id/kyc-verify')
  @ApiOperation({ summary: 'Marcar usuario como KYC verificado' })
  markKycVerified(@Param('id') id: string) {
    return this.authService.markKycVerified(id);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario' })
  getProfile(@Param('id') id: string) {
    return this.authService.getProfile(id);
  }

  // ── Legacy (keep for compatibility) ───────────────────────────────────────────

  @Post('login')
  @ApiOperation({ summary: '[Legacy] Login con email+password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
