"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const wilayah_module_1 = require("./modules/wilayah/wilayah.module");
const kas_module_1 = require("./modules/kas/kas.module");
const tagihan_module_1 = require("./modules/tagihan/tagihan.module");
const berita_module_1 = require("./modules/berita/berita.module");
const lapak_module_1 = require("./modules/lapak/lapak.module");
const agenda_module_1 = require("./modules/agenda/agenda.module");
const alert_module_1 = require("./modules/alert/alert.module");
const cctv_module_1 = require("./modules/cctv/cctv.module");
const laporan_module_1 = require("./modules/laporan/laporan.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            wilayah_module_1.WilayahModule,
            kas_module_1.KasModule,
            tagihan_module_1.TagihanModule,
            berita_module_1.BeritaModule,
            lapak_module_1.LapakModule,
            agenda_module_1.AgendaModule,
            alert_module_1.AlertModule,
            cctv_module_1.CctvModule,
            laporan_module_1.LaporanModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map