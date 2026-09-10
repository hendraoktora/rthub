import { Module } from '@nestjs/common';
import { LapakService } from './lapak.service';
import { LapakController } from './lapak.controller';

@Module({
  controllers: [LapakController],
  providers: [LapakService],
  exports: [LapakService],
})
export class LapakModule {}
