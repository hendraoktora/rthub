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
    const alert = await this.prisma.alertPanic.create({
      data: {
        userId: user.id,
        rtId: user.rtId,
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

      // Kirim ke channel RT
      await this.notificationService.sendToTopic(
        topic,
        '🚨 PERINGATAN DARURAT (SOS)!',
        `${nama} (${noRumah}) butuh bantuan: "${catatan}"`,
        payloadData,
      );

      // Kirim juga ke rthub_broadcast agar seluruh warga yang terinstall langsung berbunyi sirinenya
      if (topic !== 'rthub_broadcast') {
        await this.notificationService.sendToTopic(
          'rthub_broadcast',
          '🚨 PERINGATAN DARURAT (SOS)!',
          `${nama} (${noRumah}) butuh bantuan: "${catatan}"`,
          payloadData,
        );
      }
    } catch (_) {}

    return {
      message: '🚨 ALARM DARURAT AKTIF! Notifikasi telah dikirim ke Pos Keamanan & Pengurus RT.',
      alert,
    };
  }

  async getActiveAlerts(rtId: string) {
    return this.prisma.alertPanic.findMany({
      where: { rtId, status: StatusAlert.ACTIVE },
      include: {
        user: { select: { profile: { select: { namaLengkap: true, noRumah: true } }, phone: true } },
      },
      orderBy: { triggeredAt: 'desc' },
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
