import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen de wallet (balance y ledger)' })
  getSummary(@Query('userId') userId: string) {
    return this.walletService.getSummary(userId || 'user_123'); // Default to mock user
  }

  @Post('deposit-simulate')
  @ApiOperation({ summary: 'Simular depósito' })
  deposit(@Body() data: { userId: string; amount: number }) {
    return this.walletService.simulateDeposit(data.userId || 'user_123', data.amount);
  }

  @Post('freeze')
  @ApiOperation({ summary: 'Congelar fondos (escrow)' })
  freeze(@Body() data: { buyerId: string; amount: number; productId: string }) {
    return this.walletService.lockFunds(
      data.buyerId || 'user_123', 
      data.amount, 
      data.productId || 'prod_1'
    );
  }

  @Post('release')
  @ApiOperation({ summary: 'Liberar fondos escrow al vendedor' })
  release(@Body() data: { buyerId: string; sellerId?: string; amount: number; productId?: string }) {
    return this.walletService.releaseFunds(
      data.buyerId || 'user_123',
      data.sellerId || 'seller_456',
      data.amount,
      data.productId || 'prod_1'
    );
  }
}
