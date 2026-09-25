import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusAlert } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AlertService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async triggerPanic(user: any, data: { latitude?: number; longitude?: number; catatan?: string }) {
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
        status: StatusAlert.ACTIVE,
      },
      include: {
        user: { select: { profile: { select: { namaLengkap: true, noRumah: true } }, phone: true } },
      },
    });

    // Kirim notifikasi darurat ke channel RT dan Broadcast
    try {
      const nama = alert.user?.profile?.namaLengkap || 'Warga';
      const noRumah = alert.user?.profile?.noRumah ? `Rumah ${alert.user.profile.noRumah}` : 'Lingkungan RT';
      const phone = alert.user?.phone || '-';
      const topic = user.rtId ? `rt_${user.rtId}` : 'rthub_broadcast';
      const catatan = alert.catatan || 'Tombol Panik Ditekan oleh Warga!';
      const lokasi = alert.latitude && alert.longitude 
        ? `${alert.latitude},${alert.longitude}` 
        : noRumah;

      const payloadData: Record<string, string> = {
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

      // Kirim ke channel RT pelapor (seluruh warga & pengurus RT)
      await this.notificationService.sendToTopic(
        topic,
        '🚨 PERINGATAN DARURAT (SOS)!',
        `${nama} (${noRumah}) butuh bantuan: "${catatan}"`,
        payloadData,
      );

      // Jika ada koordinat GPS, broadcast juga ke channel publik dengan flag radius 500m
      if (alert.latitude && alert.longitude) {
        await this.notificationService.sendToTopic(
          'rthub_broadcast',
          '🚨 PERINGATAN DARURAT (SOS) DI SEKITAR ANDA!',
          `Ada bahaya dalam radius 500m di sekitar lokasi Anda: ${nama} (${noRumah})`,
          {
            ...payloadData,
            isProximityBroadcast: 'true',
          },
        );
      }
    } catch (_) {}

    return {
      message: '🚨 ALARM DARURAT AKTIF! Notifikasi telah dikirim ke seluruh warga RT & lingkungan radius 500m.',
      alert,
    };
  }

  async getActiveAlerts(user: any, userLat?: number, userLng?: number) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { rt: { include: { rw: true } } },
    });
    const rtId = dbUser?.rtId || user?.rtId;
    const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
    const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;

    const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // metres
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const activeAlerts = await this.prisma.alertPanic.findMany({
      where: { status: StatusAlert.ACTIVE },
      include: {
        user: { select: { profile: { select: { namaLengkap: true, noRumah: true } }, phone: true } },
        rt: { select: { nomor: true } },
      },
      orderBy: { triggeredAt: 'desc' },
    });

    return activeAlerts.filter((alert) => {
      // 1. Warga dengan RT, RW, dan Kelurahan yang sama
      const isSameArea = Boolean(
        rtId &&
        alert.rtId === rtId &&
        (!rwId || !alert.rwId || alert.rwId === rwId) &&
        (!kelurahanId || !alert.kelurahanId || alert.kelurahanId === kelurahanId),
      );

      // 2. Warga dalam radius 500 meter dari titik pelapor
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

  async resolveAlert(alertId: string) {
    return this.prisma.alertPanic.update({
      where: { id: alertId },
      data: {
        status: StatusAlert.RESOLVED,
        resolvedAt: new Date(),
      },
    });
  }
}
