import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusLaporan, Role } from '@prisma/client';

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  async createLaporan(user: any, data: {
    judul: string;
    deskripsi: string;
    kategori: string;
    fotoUrl?: string;
    isAnonymous?: boolean;
  }) {
    let rtId = user?.rtId;
    if (!rtId) {
      const defaultRt = await this.prisma.rT.findFirst();
      rtId = defaultRt?.id;
    }

    if (!rtId) {
      throw new BadRequestException('Unit RT tidak ditemukan.');
    }

    return this.prisma.laporanWarga.create({
      data: {
        userId: user.id,
        rtId: rtId,
        judul: data.judul,
        deskripsi: data.deskripsi || '',
        kategori: data.kategori || 'FASILITAS_UMUM',
        fotoUrl: data.fotoUrl || null,
        isAnonymous: Boolean(data.isAnonymous),
        status: StatusLaporan.PENDING,
      },
      include: {
        user: {
          select: {
            profile: {
              select: {
                namaLengkap: true,
                noRumah: true,
              },
            },
          },
        },
      },
    });
  }

  async getLaporanList(user: any) {
    if (user?.role === Role.SUPERADMIN || !user?.rtId) {
      return this.prisma.laporanWarga.findMany({
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  namaLengkap: true,
                  noRumah: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    return this.prisma.laporanWarga.findMany({
      where: {
        rtId: user.rtId,
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                namaLengkap: true,
                noRumah: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(laporanId: string, data: { status: StatusLaporan; tanggapanRT?: string }) {
    return this.prisma.laporanWarga.update({
      where: { id: laporanId },
      data: {
        status: data.status,
        tanggapanRT: data.tanggapanRT,
      },
    });
  }
}
