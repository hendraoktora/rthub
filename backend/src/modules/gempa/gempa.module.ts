import { Module } from '@nestjs/common';
import { GempaService } from './gempa.service';
import { GempaController } from './gempa.controller';

@Module({
  controllers: [GempaController],
  providers: [GempaService],
  exports: [GempaService],
})
export class GempaModule {}
