import { Module } from '@nestjs/common';
import { DeliveryGateway } from './delivery.gateway';

@Module({
  providers: [DeliveryGateway]
})
export class DeliveryModule {}
