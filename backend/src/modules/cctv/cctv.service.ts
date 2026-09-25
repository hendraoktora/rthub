import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CctvService {
  constructor(private prisma: PrismaService) {}

  async getCctvList(user: any) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { rt: { include: { rw: true } } },
    });
    const rtId = dbUser?.rtId || user?.rtId;
    const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
    const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;

    const orConditions: any[] = [];
    if (rtId) {
      // CCTV RT: HANYA dapat dilihat oleh warga di RT yang sama persis
      orConditions.push({ rtId: rtId, isActive: true });
    }
    if (rwId && kelurahanId) {
      // CCTV RW: HANYA titik kamera bersama se-RW (rtId bernilai null)
      orConditions.push({ rtId: null, rwId: rwId, kelurahanId: kelurahanId, isActive: true });
    }

    if (orConditions.length === 0) {
      return [];
    }

    return this.prisma.cCTV.findMany({
      where: { OR: orConditions },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCctv(user: any, data: { namaTitik: string; streamUrl: string; thumbnailUrl?: string }) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { rt: { include: { rw: true } } },
    });
    const rtId = dbUser?.rtId || user?.rtId;
    const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
    const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;

    return this.prisma.cCTV.create({
      data: {
        rtId: rtId || null,
        rwId: rwId || null,
        kelurahanId: kelurahanId || null,
        namaTitik: data.namaTitik,
        streamUrl: data.streamUrl,
        thumbnailUrl: data.thumbnailUrl || null,
        isActive: true,
      },
    });
  }

  async deleteCctv(id: string, user: any) {
    return this.prisma.cCTV.deleteMany({
      where: {
        id,
        OR: [
          { rtId: user.rtId },
          { rwId: user.rwId },
        ],
      },
    });
  }
}
