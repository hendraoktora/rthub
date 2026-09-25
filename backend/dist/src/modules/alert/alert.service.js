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
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        const rtId = dbUser?.rtId || user?.rtId;
        const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        const alert = await this.prisma.alertPanic.create({
            data: {
                userId: user.id,
                rtId: rtId,
                rwId: rwId || null,
                kelurahanId: kelurahanId || null,
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
            if (alert.latitude && alert.longitude) {
                await this.notificationService.sendToTopic('rthub_broadcast', '🚨 PERINGATAN DARURAT (SOS) DI SEKITAR ANDA!', `Ada bahaya dalam radius 500m di sekitar lokasi Anda: ${nama} (${noRumah})`, {
                    ...payloadData,
                    isProximityBroadcast: 'true',
                });
            }
        }
        catch (_) { }
        return {
            message: '🚨 ALARM DARURAT AKTIF! Notifikasi telah dikirim ke seluruh warga RT & lingkungan radius 500m.',
            alert,
        };
    }
    async getActiveAlerts(user, userLat, userLng) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        const rtId = dbUser?.rtId || user?.rtId;
        const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3;
            const φ1 = (lat1 * Math.PI) / 180;
            const φ2 = (lat2 * Math.PI) / 180;
            const Δφ = ((lat2 - lat1) * Math.PI) / 180;
            const Δλ = ((lon2 - lon1) * Math.PI) / 180;
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };
        const activeAlerts = await this.prisma.alertPanic.findMany({
            where: { status: client_1.StatusAlert.ACTIVE },
            include: {
                user: { select: { profile: { select: { namaLengkap: true, noRumah: true } }, phone: true } },
                rt: { select: { nomor: true } },
            },
            orderBy: { triggeredAt: 'desc' },
        });
        return activeAlerts.filter((alert) => {
            const isSameArea = Boolean(rtId &&
                alert.rtId === rtId &&
                (!rwId || !alert.rwId || alert.rwId === rwId) &&
                (!kelurahanId || !alert.kelurahanId || alert.kelurahanId === kelurahanId));
            let isWithin500m = false;
            if (userLat != null && userLng != null && alert.latitude != null && alert.longitude != null) {
                const dist = getDistanceMeters(userLat, userLng, alert.latitude, alert.longitude);
                if (dist <= 500) {
                    isWithin500m = true;
                }
            }
            return isSameArea || isWithin500m;
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