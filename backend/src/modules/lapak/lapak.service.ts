import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LapakService {
  constructor(private prisma: PrismaService) {}

  // Marketplace cross-RT (Shared se-RW atau se-Kelurahan)
  async getFeedLapak(user: any) {
    const filters: any[] = [];
    if (user?.rwId) filters.push({ rwId: user.rwId });
    if (user?.kelurahanId) filters.push({ kelurahanId: user.kelurahanId });
    if (user?.rtId) filters.push({ rtId: user.rtId });

    let products = await this.prisma.lapakProduk.findMany({
      where: {
        ...(filters.length > 0 ? { OR: filters } : {}),
        isActive: true,
      },
      include: {
        seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
        rt: { select: { nomor: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (products.length === 0) {
      products = await this.prisma.lapakProduk.findMany({
        where: { isActive: true },
        include: {
          seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
          rt: { select: { nomor: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    return products;
  }

  // Listing Kontrakan se-RW / Kelurahan
  async getFeedKontrakan(user: any) {
    const filters: any[] = [];
    if (user?.rwId) filters.push({ rwId: user.rwId });
    if (user?.kelurahanId) filters.push({ kelurahanId: user.kelurahanId });
    if (user?.rtId) filters.push({ rtId: user.rtId });

    return this.prisma.infoKontrakan.findMany({
      where: {
        ...(filters.length > 0 ? { OR: filters } : {}),
        status: 'TERSEDIA',
      },
      include: {
        rt: { select: { nomor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduk(user: any, data: { judul: string; deskripsi: string; harga: number; kategori: string; kontakWa: string; fotoUrl?: string }) {
    let rtId = user?.rtId;
    let rwId = user?.rwId;
    let kelurahanId = user?.kelurahanId;

    if (!rtId || !rwId || !kelurahanId) {
      const defaultRt = await this.prisma.rT.findFirst();
      if (defaultRt) {
        rtId = rtId || defaultRt.id;
        rwId = rwId || defaultRt.rwId;
        const rw = await this.prisma.rW.findUnique({ where: { id: defaultRt.rwId } });
        kelurahanId = kelurahanId || rw?.kelurahanId || null;
      }
    }

    return this.prisma.lapakProduk.create({
      data: {
        sellerId: user.id,
        rtId: rtId,
        rwId: rwId,
        kelurahanId: kelurahanId,
        judul: data.judul,
        deskripsi: data.deskripsi || '',
        harga: Number(data.harga) || 0,
        kategori: data.kategori || 'PRODUK',
        kontakWa: data.kontakWa || user.phone,
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
