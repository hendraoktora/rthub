import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express, { Express } from 'express';

const server: Express = express();
let isAppInitialized = false;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS for Flutter & Web Admin
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('RtHub REST API')
    .setDescription(
      'Dokumentasi API Terpadu Platform Pintar Lingkungan RtHub (Kelurahan, RW, RT, Warga, Kas, Tagihan, Lapak, dan Keamanan)',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth (Autentikasi & Registrasi)', 'Registrasi mandiri RT (auto-grouping), pendaftaran warga, dan login')
    .addTag('Wilayah (Hierarki Kelurahan, RW, RT)', 'Navigasi dan pemilihan wilayah berjenjang')
    .addTag('Kas RT (Pembukuan & Saldo Lingkungan)', 'Pencatatan kas masuk, kas keluar, dan saldo transparan')
    .addTag('Tagihan & Pembayaran (IPL, Kas & Fee Admin)', 'Penerbitan tagihan massal, pembayaran QRIS/VA, dan fee admin')
    .addTag('Berita & Pengumuman (Hierarkis RT, RW, Kelurahan)', 'Broadcast berita multi-level')
    .addTag('Lapak UMKM & Sewa Kontrakan (Cross-RT se-RW/Kelurahan)', 'Marketplace dan listing properti se-RW/Kelurahan')
    .addTag('Agenda & Jadwal Kegiatan Lingkungan (Kalender RT/RW)', 'Jadwal kerja bakti, rapat, posyandu, ronda')
    .addTag('Alert & Panic Button Darurat (Keamanan Lingkungan)', 'Emergency panic button & notifikasi darurat')
    .addTag('CCTV Lingkungan (Live Stream RT & RW)', 'Pemantauan CCTV live stream')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  isAppInitialized = true;
  return app;
}

// Export default handler for Vercel Serverless Function
export default async function handler(req: any, res: any) {
  if (!isAppInitialized) {
    await bootstrap();
  }
  server(req, res);
}

// Standalone server mode for local dev / non-Vercel environments
if (!process.env.VERCEL) {
  bootstrap().then(() => {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`🚀 RtHub Backend running on: http://0.0.0.0:${port}`);
      console.log(`📑 Swagger Documentation available at: http://0.0.0.0:${port}/api/docs`);
    });
  });
}

