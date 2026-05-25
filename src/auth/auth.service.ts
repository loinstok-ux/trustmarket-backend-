import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { User } from './entities/user.entity';
import { OtpCode } from './entities/otp-code.entity';
import { LoginDto } from './dto/login.dto';
import { CompleteRegisterDto } from './dto/complete-register.dto';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(OtpCode)
    private readonly otpRepo: Repository<OtpCode>,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async saveOtp(target: string, type: 'email' | 'sms'): Promise<string> {
    // Invalidate previous OTPs for this target
    await this.otpRepo.update({ target, type, used: false }, { used: true });

    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.otpRepo.save(this.otpRepo.create({ target, code, type, expiresAt }));
    return code;
  }

  private async verifyOtp(target: string, code: string, type: 'email' | 'sms'): Promise<boolean> {
    const otp = await this.otpRepo.findOne({
      where: {
        target,
        code,
        type,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!otp) return false;

    await this.otpRepo.update(otp.id, { used: true });
    return true;
  }

  // ── Email OTP ─────────────────────────────────────────────────────────────────

  async sendEmailOtp(email: string): Promise<{ message: string }> {
    const code = await this.saveOtp(email, 'email');

    const { data, error } = await this.resend.emails.send({
      from: 'TrustMarket <onboarding@resend.dev>',
      to: email,
      subject: `Tu código de verificación: ${code}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #006b47; font-size: 28px; margin: 0;">TrustMarket</h1>
            <p style="color: #3e4942; margin-top: 4px;">Mercado P2P Seguro</p>
          </div>
          <div style="background: #f8f9fa; border-radius: 16px; padding: 32px; text-align: center;">
            <p style="color: #191c1d; font-size: 16px; margin-bottom: 24px;">
              Tu código de verificación es:
            </p>
            <div style="background: #006b47; color: white; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 20px; border-radius: 12px; font-family: monospace;">
              ${code}
            </div>
            <p style="color: #6e7a71; font-size: 13px; margin-top: 20px;">
              Este código expira en <strong>10 minutos</strong>.<br/>
              Si no solicitaste este código, ignora este mensaje.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error enviando correo:', error);
      throw new BadRequestException(`Resend Error: ${error.message}`);
    }

    return { message: 'Código enviado al correo electrónico' };
  }

  async verifyEmailOtp(email: string, code: string): Promise<{ verified: boolean; isExistingUser: boolean }> {
    const valid = await this.verifyOtp(email, code, 'email');
    if (!valid) {
      throw new BadRequestException('Código inválido o expirado');
    }

    const existingUser = await this.userRepo.findOne({ where: { email } });
    return { verified: true, isExistingUser: !!existingUser };
  }

  // ── Register (complete after email OTP verified) ───────────────────────────────

  async completeRegister(dto: CompleteRegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Ya existe una cuenta con este correo');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashed,
      name: dto.name,
      kycVerified: false,
      plan: 'free',
    });

    const savedUser = await this.userRepo.save(user);
    const payload = { email: savedUser.email, sub: savedUser.id };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        phone: savedUser.phone,
        kycVerified: savedUser.kycVerified,
        plan: savedUser.plan,
      },
    };
  }

  // ── Login via OTP ──────────────────────────────────────────────────────────────

  async loginWithOtp(email: string, code: string) {
    const valid = await this.verifyOtp(email, code, 'email');
    if (!valid) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('No existe una cuenta con este correo');
    }

    const payload = { email: user.email, sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        kycVerified: user.kycVerified,
        plan: user.plan,
      },
    };
  }

  // ── Update phone ───────────────────────────────────────────────────────────────

  async updatePhone(userId: string, phone: string): Promise<{ message: string }> {
    await this.userRepo.update(userId, { phone });
    return { message: 'Teléfono actualizado' };
  }

  // ── KYC ───────────────────────────────────────────────────────────────────────

  async markKycVerified(userId: string) {
    await this.userRepo.update(userId, { kycVerified: true });
    return { success: true };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const { password, ...result } = user;
    return result;
  }

  // ── Legacy login (keep for compatibility) ──────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        kycVerified: user.kycVerified,
        plan: user.plan,
      },
    };
  }
}
