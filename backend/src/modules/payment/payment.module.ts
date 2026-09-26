import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { DuitkuService } from './duitku.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController],
  providers: [DuitkuService],
  exports: [DuitkuService],
})
export class PaymentModule {}
