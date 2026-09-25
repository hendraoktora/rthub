import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { WilayahModule } from './modules/wilayah/wilayah.module';
import { KasModule } from './modules/kas/kas.module';
import { TagihanModule } from './modules/tagihan/tagihan.module';
import { BeritaModule } from './modules/berita/berita.module';
import { LapakModule } from './modules/lapak/lapak.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { AlertModule } from './modules/alert/alert.module';
import { CctvModule } from './modules/cctv/cctv.module';
import { LaporanModule } from './modules/laporan/laporan.module';
import { NotificationModule } from './modules/notification/notification.module';
import { GempaModule } from './modules/gempa/gempa.module';
import { AddonsModule } from './modules/addons/addons.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    NotificationModule,
    GempaModule,
    AuthModule,
    WilayahModule,
    KasModule,
    TagihanModule,
    BeritaModule,
    LapakModule,
    AgendaModule,
    AlertModule,
    CctvModule,
    LaporanModule,
    AddonsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
