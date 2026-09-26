import { Module } from '@nestjs/common';
import { KasService } from './kas.service';
import { KasController } from './kas.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [KasController],
  providers: [KasService],
  exports: [KasService],
})
export class KasModule {}
