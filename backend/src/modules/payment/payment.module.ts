import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { DuitkuService } from './duitku.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AddonsModule } from '../addons/addons.module';
import { LapakModule } from '../lapak/lapak.module';

@Module({
  imports: [PrismaModule, AddonsModule, LapakModule],
  controllers: [PaymentController],
  providers: [DuitkuService],
  exports: [DuitkuService],
})
export class PaymentModule {}
