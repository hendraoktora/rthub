import { Module } from '@nestjs/common';
import { BeritaService } from './berita.service';
import { BeritaController } from './berita.controller';

@Module({
  controllers: [BeritaController],
  providers: [BeritaService],
  exports: [BeritaService],
})
export class BeritaModule {}
