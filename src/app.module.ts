import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { KycModule } from './kyc/kyc.module';
import { ProductsModule } from './products/products.module';
import { ChatModule } from './chat/chat.module';
import { WalletModule } from './wallet/wallet.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // Automagically syncs DB schema (ONLY FOR DEV!)
        ssl: {
          rejectUnauthorized: false, // Required for Supabase connections
        },
      }),
    }),
    AuthModule, 
    KycModule, 
    ProductsModule, 
    ChatModule, 
    WalletModule, 
    DeliveryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
