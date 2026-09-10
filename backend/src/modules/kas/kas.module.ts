import { Module } from '@nestjs/common';
import { KasService } from './kas.service';
import { KasController } from './kas.controller';

@Module({
  controllers: [KasController],
  providers: [KasService],
  exports: [KasService],
})
export class KasModule {}
