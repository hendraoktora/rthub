import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CctvService {
  constructor(private prisma: PrismaService) {}

  async getCctvList(user: any) {
    return this.prisma.cCTV.findMany({
      where: {
        OR: [
          { rtId: user.rtId },
          { rwId: user.rwId },
        ],
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCctv(user: any, data: { namaTitik: string; streamUrl: string; thumbnailUrl?: string }) {
    return this.prisma.cCTV.create({
      data: {
        rtId: user.rtId,
        rwId: user.rwId,
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
