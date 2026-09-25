import { Module } from '@nestjs/common';
import { LaporanController } from './laporan.controller';
import { LaporanService } from './laporan.service';
import { AddonsModule } from '../addons/addons.module';

@Module({
  imports: [AddonsModule],
  controllers: [LaporanController],
  providers: [LaporanService],
  exports: [LaporanService],
})
export class LaporanModule {}
