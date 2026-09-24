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
const notification_service_1 = require("../notification/notification.service");
let AlertService = class AlertService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
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
        try {
            const nama = alert.user?.profile?.namaLengkap || 'Warga';
            const noRumah = alert.user?.profile?.noRumah ? `Rumah ${alert.user.profile.noRumah}` : 'Lingkungan RT';
            const phone = alert.user?.phone || '-';
            const topic = user.rtId ? `rt_${user.rtId}` : 'rthub_broadcast';
            const catatan = alert.catatan || 'Tombol Panik Ditekan oleh Warga!';
            const lokasi = alert.latitude && alert.longitude
                ? `${alert.latitude},${alert.longitude}`
                : noRumah;
            const payloadData = {
                type: 'PANIC',
                alertId: alert.id,
                senderUserId: user.id || '',
                senderPhone: phone || '',
                rtId: user.rtId || '',
                namaPelapor: nama,
                noRumah: alert.user?.profile?.noRumah || '-',
                lokasi: lokasi,
                catatan: catatan,
                phone: phone,
                latitude: alert.latitude ? alert.latitude.toString() : '',
                longitude: alert.longitude ? alert.longitude.toString() : '',
                timestamp: new Date().toISOString(),
            };
            await this.notificationService.sendToTopic(topic, '🚨 PERINGATAN DARURAT (SOS)!', `${nama} (${noRumah}) butuh bantuan: "${catatan}"`, payloadData);
            if (topic !== 'rthub_broadcast') {
                await this.notificationService.sendToTopic('rthub_broadcast', '🚨 PERINGATAN DARURAT (SOS)!', `${nama} (${noRumah}) butuh bantuan: "${catatan}"`, payloadData);
            }
        }
        catch (_) { }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], AlertService);
//# sourceMappingURL=alert.service.js.map