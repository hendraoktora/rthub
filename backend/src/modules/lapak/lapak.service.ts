import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LapakService {
  constructor(private prisma: PrismaService) {}

  // Marketplace cross-RT (Shared se-RW atau se-Kelurahan)
  async getFeedLapak(user: any) {
    return this.prisma.lapakProduk.findMany({
      where: {
        OR: [
          { rwId: user.rwId },
          { kelurahanId: user.kelurahanId },
        ],
        isActive: true,
      },
      include: {
        seller: { select: { profile: { select: { namaLengkap: true, noRumah: true } } } },
        rt: { select: { nomor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Listing Kontrakan se-RW / Kelurahan
  async getFeedKontrakan(user: any) {
    return this.prisma.infoKontrakan.findMany({
      where: {
        OR: [
          { rwId: user.rwId },
          { kelurahanId: user.kelurahanId },
        ],
        status: 'TERSEDIA',
      },
      include: {
        rt: { select: { nomor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduk(user: any, data: { judul: string; deskripsi: string; harga: number; kategori: string; kontakWa: string; fotoUrl?: string }) {
    return this.prisma.lapakProduk.create({
      data: {
        sellerId: user.id,
        rtId: user.rtId,
        rwId: user.rwId,
        kelurahanId: user.kelurahanId,
        judul: data.judul,
        deskripsi: data.deskripsi,
        harga: data.harga,
        kategori: data.kategori || 'PRODUK',
        kontakWa: data.kontakWa,
        fotoUrl: data.fotoUrl || null,
      },
    });
  }

  async deleteProduk(id: string, user: any) {
    return this.prisma.lapakProduk.delete({
      where: { id },
    });
  }
}
