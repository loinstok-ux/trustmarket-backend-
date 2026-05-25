import { Injectable } from '@nestjs/common';

@Injectable()
export class KycService {
  processDocument(data: any) {
    return {
      success: true,
      extractedData: {
        name: 'Test User',
        cedula: 'V-12345678',
      },
    };
  }

  generateChallenge() {
    return { nonce: 'mock-nonce-123456', expiresIn: 300 };
  }

  verifyBiometric(data: any) {
    return { verified: true, message: 'Biometría simulada exitosa' };
  }
}
