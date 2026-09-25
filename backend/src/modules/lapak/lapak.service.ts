import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LapakService {
  constructor(private prisma: PrismaService) {}

  // Marketplace cross-RT (Shared se-RW atau se-Kelurahan)
  async getFeedLapak(user: any) {
    let rwId = user?.rwId || user?.rt?.rwId;
    let kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
    let rtId = user?.rtId;

    if ((!rwId || !kelurahanId) && rtId) {
      const rt = await this.prisma.rT.findUnique({ where: { id: rtId }, include: { rw: true } });
      if (rt) {
        rwId = rwId || rt.rwId;
        kelurahanId = kelurahanId || rt.rw?.kelurahanId;
      }
    }

    const filters: any[] = [];
    if (rwId) filters.push({ rwId });
    if (kelurahanId) filters.push({ kelurahanId });
    if (rtId) filters.push({ rtId });

    if (filters.length === 0) {
      return this.prisma.lapakProduk.findMany({
        where: { isActive: true },
        include: {
          seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
          rt: { select: { nomor: true } },
        },
        orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      });
    }

    return this.prisma.lapakProduk.findMany({
      where: {
        OR: [
          ...filters,
          { isPromoted: true, paketIklan: 'SEMUA' },
        ],
        isActive: true,
      },
      include: {
        seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
        rt: { select: { nomor: true } },
      },
      orderBy: [
        { isPromoted: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 50,
    });
  }

  // Listing Kontrakan se-RW / Kelurahan
  async getFeedKontrakan(user: any) {
    const rwId = user?.rwId || user?.rt?.rwId;
    const kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
    const rtId = user?.rtId;

    const filters: any[] = [];
    if (rwId) filters.push({ rwId });
    if (kelurahanId) filters.push({ kelurahanId });
    if (rtId) filters.push({ rtId });

    if (filters.length === 0) {
      return [];
    }

    return this.prisma.infoKontrakan.findMany({
      where: {
        OR: filters,
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
    let rwId = user?.rwId || user?.rt?.rwId;
    let kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;

    if ((!rwId || !kelurahanId) && rtId) {
      const rt = await this.prisma.rT.findUnique({ where: { id: rtId }, include: { rw: true } });
      if (rt) {
        rwId = rwId || rt.rwId;
        kelurahanId = kelurahanId || rt.rw?.kelurahanId;
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

  async boostProduk(
    id: string,
    user: any,
    data: { packageType?: string; scope?: string; durationDays?: number; price?: number; paymentMethod?: string; promotedUntil?: string },
  ) {
    const scope = (data.scope || 'RT').toUpperCase();
    const duration = Number(data.durationDays) || 7;
    const expiry = data.promotedUntil
      ? new Date(data.promotedUntil)
      : new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    return this.prisma.lapakProduk.update({
      where: { id },
      data: {
        isPromoted: true,
        promotedBadge: 'SPONSORED',
        paketIklan: scope,
        promotedUntil: expiry,
      },
      include: {
        seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
        rt: { select: { nomor: true } },
      },
    });
  }

  async deleteProduk(id: string, user: any) {
    return this.prisma.lapakProduk.delete({
      where: { id },
    });
  }
}
