import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  private async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ userId, availableBalance: 0, frozenBalance: 0 });
      await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getSummary(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const transactions = await this.txRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10
    });

    return {
      availableBalance: Number(wallet.availableBalance),
      frozenBalance: Number(wallet.frozenBalance),
      totalBalance: Number(wallet.availableBalance) + Number(wallet.frozenBalance),
      recentTransactions: transactions
    };
  }

  async simulateDeposit(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('El monto debe ser mayor a 0');

    const wallet = await this.getOrCreateWallet(userId);
    wallet.availableBalance = Number(wallet.availableBalance) + amount;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      userId,
      type: 'DEPOSIT',
      amount,
      status: 'COMPLETED'
    });
    await this.txRepo.save(tx);

    return this.getSummary(userId);
  }

  async lockFunds(buyerId: string, amount: number, productId: string) {
    const wallet = await this.getOrCreateWallet(buyerId);
    
    if (Number(wallet.availableBalance) < amount) {
      throw new BadRequestException('Fondos insuficientes');
    }

    wallet.availableBalance = Number(wallet.availableBalance) - amount;
    wallet.frozenBalance = Number(wallet.frozenBalance) + amount;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      userId: buyerId,
      type: 'ESCROW_LOCK',
      amount,
      relatedProductId: productId,
      status: 'COMPLETED'
    });
    await this.txRepo.save(tx);

    return { success: true, message: 'Fondos congelados exitosamente en Escrow' };
  }

  async releaseFunds(buyerId: string, sellerId: string, amount: number, productId: string) {
    const buyerWallet = await this.getOrCreateWallet(buyerId);
    
    if (Number(buyerWallet.frozenBalance) < amount) {
      throw new BadRequestException('Fondos congelados insuficientes o inconsistentes');
    }

    // Remove from buyer's frozen
    buyerWallet.frozenBalance = Number(buyerWallet.frozenBalance) - amount;
    await this.walletRepo.save(buyerWallet);

    const buyerTx = this.txRepo.create({
      userId: buyerId,
      type: 'ESCROW_RELEASE',
      amount,
      relatedProductId: productId,
      status: 'COMPLETED'
    });
    await this.txRepo.save(buyerTx);

    // Add to seller's available
    const sellerWallet = await this.getOrCreateWallet(sellerId);
    sellerWallet.availableBalance = Number(sellerWallet.availableBalance) + amount;
    await this.walletRepo.save(sellerWallet);

    const sellerTx = this.txRepo.create({
      userId: sellerId,
      type: 'DEPOSIT', // To the seller it looks like a deposit
      amount,
      relatedProductId: productId,
      status: 'COMPLETED'
    });
    await this.txRepo.save(sellerTx);

    return { success: true, message: 'Fondos liberados al vendedor exitosamente' };
  }
}
