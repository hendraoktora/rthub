"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AlertService = class AlertService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async triggerPanic(user, data) {
        const alert = await this.prisma.alertPanic.create({
            data: {
                userId: user.id,
                rtId: user.rtId,
                latitude: data.latitude || null,
                longitude: data.longitude || null,
                catatan: data.catatan || 'Tombol Panik Ditekan oleh Warga!',
                status: client_1.StatusAlert.ACTIVE,
            },
            include: {
                user: { select: { profile: { select: { namaLengkap: true, noRumah: true } }, phone: true } },
            },
        });
        return {
            message: '🚨 ALARM DARURAT AKTIF! Notifikasi telah dikirim ke Pos Keamanan & Pengurus RT.',
            alert,
        };
    }
    async getActiveAlerts(rtId) {
        return this.prisma.alertPanic.findMany({
            where: { rtId, status: client_1.StatusAlert.ACTIVE },
            include: {
                user: { select: { profile: { select: { namaLengkap: true, noRumah: true } }, phone: true } },
            },
            orderBy: { triggeredAt: 'desc' },
        });
    }
    async resolveAlert(alertId) {
        return this.prisma.alertPanic.update({
            where: { id: alertId },
            data: {
                status: client_1.StatusAlert.RESOLVED,
                resolvedAt: new Date(),
            },
        });
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertService);
//# sourceMappingURL=alert.service.js.map