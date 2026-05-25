import { Controller, Post, Body } from '@nestjs/common';
import { KycService } from './kyc.service';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload-document')
  uploadDocument(@Body() body: any) {
    return this.kycService.processDocument(body);
  }

  @Post('biometric-challenge')
  biometricChallenge() {
    return this.kycService.generateChallenge();
  }

  @Post('verify-biometric')
  verifyBiometric(@Body() body: any) {
    return this.kycService.verifyBiometric(body);
  }
}
