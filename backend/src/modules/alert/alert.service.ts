import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusAlert } from '@prisma/client';

@Injectable()
export class AlertService {
  constructor(private prisma: PrismaService) {}

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
