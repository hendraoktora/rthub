"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("./app.module");
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
let isAppInitialized = false;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('RtHub REST API')
        .setDescription('Dokumentasi API Terpadu Platform Pintar Lingkungan RtHub (Kelurahan, RW, RT, Warga, Kas, Tagihan, Lapak, dan Keamanan)')
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.init();
    isAppInitialized = true;
    return app;
}
async function handler(req, res) {
    try {
        if (!isAppInitialized) {
            await bootstrap();
        }
        server(req, res);
    }
    catch (error) {
        console.error('SERVERLESS INIT ERROR:', error);
        res.status(500).json({
            error: 'Initialization Error',
            message: error?.message || String(error),
            stack: error?.stack,
        });
    }
}
if (!process.env.VERCEL) {
    bootstrap().then(() => {
        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log(`🚀 RtHub Backend running on: http://0.0.0.0:${port}`);
            console.log(`📑 Swagger Documentation available at: http://0.0.0.0:${port}/api/docs`);
        });
    });
}
//# sourceMappingURL=main.js.map