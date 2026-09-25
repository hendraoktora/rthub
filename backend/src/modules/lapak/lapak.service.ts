import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LapakService {
  constructor(private prisma: PrismaService) {}

  // Marketplace cross-RT (Shared se-RW atau se-Kelurahan) dengan hierarki iklan ketat
  async getFeedLapak(user: any) {
    try {
      let rwId = user?.rwId || user?.rt?.rwId;
      let kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
      let rtId = user?.rtId;

      if (user?.id) {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: user.id },
          include: { rt: { include: { rw: true } } },
        });
        if (dbUser) {
          rwId = dbUser.rwId || dbUser.rt?.rwId || rwId;
          kelurahanId = dbUser.kelurahanId || dbUser.rt?.rw?.kelurahanId || kelurahanId;
          rtId = dbUser.rtId || rtId;
        }
      }

      const orConditions: any[] = [];

      // 1. Seller selalu melihat produk miliknya sendiri
      if (user?.id) {
        orConditions.push({ sellerId: user.id });
      }

      // 2. Paket Global / Semua: Tampil ke seluruh warga aplikasi terdaftar
      orConditions.push({
        isPromoted: true,
        paketIklan: { in: ['SEMUA', 'GLOBAL', 'NASIONAL', 'IKLAN_GLOBAL'] },
      });

      // 3. Paket Kelurahan: Tampil ke seluruh warga yang Kelurahannya sama
      if (kelurahanId) {
        orConditions.push({
          isPromoted: true,
          paketIklan: { in: ['KELURAHAN', 'LURAH', 'IKLAN_KELURAHAN'] },
          kelurahanId: kelurahanId,
        });
      }

      // 4. Paket RW: Tampil ke seluruh warga yang RW dan Kelurahannya SAMA PERSIS
      if (rwId && kelurahanId) {
        orConditions.push({
          isPromoted: true,
          paketIklan: { in: ['RW', 'IKLAN_RW'] },
          rwId: rwId,
          kelurahanId: kelurahanId,
        });
      } else if (rwId) {
        orConditions.push({
          isPromoted: true,
          paketIklan: { in: ['RW', 'IKLAN_RW'] },
          rwId: rwId,
        });
      }

      // 5. Paket RT: HANYA tampil ke seluruh warga yang RT, RW, dan Kelurahannya SAMA PERSIS
      if (rtId && rwId && kelurahanId) {
        orConditions.push({
          isPromoted: true,
          paketIklan: { in: ['RT', 'IKLAN_RT'] },
          rtId: rtId,
          rwId: rwId,
          kelurahanId: kelurahanId,
        });
      } else if (rtId) {
        orConditions.push({
          isPromoted: true,
          paketIklan: { in: ['RT', 'IKLAN_RT'] },
          rtId: rtId,
        });
      }

      // 6. Produk reguler (non-promoted) se-RT dan se-RW
      if (rtId) {
        orConditions.push({
          isPromoted: false,
          rtId: rtId,
        });
      }
      if (rwId && kelurahanId) {
        orConditions.push({
          isPromoted: false,
          rwId: rwId,
          kelurahanId: kelurahanId,
        });
      }

      try {
        // Otomatis nonaktifkan iklan yang sudah lewat batas durasi
        this.prisma.$executeRawUnsafe(
          `UPDATE LapakProduk SET isPromoted = 0, promotedBadge = NULL WHERE isPromoted = 1 AND promotedUntil IS NOT NULL AND promotedUntil <= NOW()`
        ).catch(() => {});

        const now = new Date();
        const sanitizePromotion = (r: any) => {
          const expired = r.promotedUntil ? new Date(r.promotedUntil) <= now : false;
          const isPromoted = Boolean((r.isPromoted === true || r.isPromoted === 1 || r.isPromoted === '1') && !expired);
          
          let sisaDurasiHari: number | null = null;
          let sisaDurasiJam: number | null = null;
          if (isPromoted && r.promotedUntil) {
            const diffMs = Math.max(0, new Date(r.promotedUntil).getTime() - now.getTime());
            sisaDurasiHari = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            sisaDurasiJam = Math.ceil(diffMs / (1000 * 60 * 60));
          }

          return {
            ...r,
            isPromoted,
            promotedBadge: isPromoted ? (r.promotedBadge || 'SPONSORED') : null,
            paketIklan: isPromoted ? r.paketIklan : null,
            promotedAt: isPromoted ? r.promotedAt : null,
            promotedUntil: isPromoted ? r.promotedUntil : null,
            sisaDurasiHari,
            sisaDurasiJam,
          };
        };

        const items = await this.prisma.lapakProduk.findMany({
          where: {
            OR: orConditions,
            isActive: true,
          },
          include: {
            seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
            rt: { select: { id: true, nomor: true, rwId: true, rw: { select: { id: true, nomor: true, kelurahanId: true } } } },
          },
          orderBy: [
            { isPromoted: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 50,
        });
        return items.map(sanitizePromotion);
      } catch (innerErr) {
        return [];
      }
    } catch (outerErr) {
      console.error('getFeedLapak error:', outerErr);
      return [];
    }
  }

  // Listing Kontrakan se-RW / Kelurahan
  async getFeedKontrakan(user: any) {
    const rwId = user?.rwId || user?.rt?.rwId;
    const kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
    const rtId = user?.rtId;

    const filters: any[] = [];
    if (rtId) filters.push({ rtId });
    if (rwId) filters.push({ rwId });
    if (kelurahanId) filters.push({ kelurahanId });

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
    if (!user || !user.id) {
      throw new BadRequestException('Autentikasi akun diperlukan untuk membuat produk.');
    }
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { rt: { include: { rw: true } } },
    });
    let rtId = dbUser?.rtId || user?.rtId;
    let rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
    let kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;

    if (!rwId && rtId) {
      const rt = await this.prisma.rT.findUnique({ where: { id: rtId }, include: { rw: true } });
      if (rt) {
        rwId = rt.rwId;
        kelurahanId = kelurahanId || rt.rw?.kelurahanId;
      }
    }
    if (!kelurahanId && rwId) {
      const rw = await this.prisma.rW.findUnique({ where: { id: rwId } });
      if (rw) {
        kelurahanId = rw.kelurahanId;
      }
    }

    if (!rtId || !rwId || !kelurahanId) {
      throw new BadRequestException('Data wilayah (RT/RW/Kelurahan) Anda belum lengkap.');
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
        isPromoted: false,
        promotedBadge: null,
        paketIklan: null,
        promotedUntil: null,
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
    const now = new Date();

    const existing = await this.prisma.lapakProduk.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Produk tidak ditemukan.');
    }

    // Jika iklan saat ini masih aktif, tambahkan durasi baru ke sisa durasi yang berjalan!
    let baseTime = now.getTime();
    let initialPromotedAt = existing.promotedAt || now;
    if (existing.isPromoted && existing.promotedUntil && new Date(existing.promotedUntil) > now) {
      baseTime = new Date(existing.promotedUntil).getTime();
    } else {
      initialPromotedAt = now;
    }

    const expiry = data.promotedUntil
      ? new Date(data.promotedUntil)
      : new Date(baseTime + duration * 24 * 60 * 60 * 1000);

    const diffMs = Math.max(0, expiry.getTime() - now.getTime());
    const sisaDurasiHari = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const sisaDurasiJam = Math.ceil(diffMs / (1000 * 60 * 60));

    try {
      const updated = await this.prisma.lapakProduk.update({
        where: { id },
        data: {
          isPromoted: true,
          promotedBadge: 'SPONSORED',
          paketIklan: scope,
          promotedAt: initialPromotedAt,
          promotedUntil: expiry,
        },
        include: {
          seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
          rt: { select: { nomor: true } },
        },
      });
      return {
        ...updated,
        sisaDurasiHari,
        sisaDurasiJam,
      };
    } catch (err) {
      // Direct SQL fallback if Prisma schema/client on server is older
      const formattedExpiry = expiry.toISOString().slice(0, 19).replace('T', ' ');
      const formattedPromotedAt = initialPromotedAt.toISOString().slice(0, 19).replace('T', ' ');
      await this.prisma.$executeRawUnsafe(
        `UPDATE LapakProduk SET isPromoted = 1, promotedBadge = 'SPONSORED', paketIklan = ?, promotedAt = ?, promotedUntil = ? WHERE id = ?`,
        scope,
        formattedPromotedAt,
        formattedExpiry,
        id,
      );
      const res = await this.prisma.lapakProduk.findUnique({
        where: { id },
        include: {
          seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
          rt: { select: { nomor: true } },
        },
      });
      return {
        ...res,
        isPromoted: true,
        promotedBadge: 'SPONSORED',
        paketIklan: scope,
        promotedAt: initialPromotedAt,
        promotedUntil: expiry,
        sisaDurasiHari,
        sisaDurasiJam,
      };
    }
  }

  async deleteProduk(id: string, user: any) {
    return this.prisma.lapakProduk.delete({
      where: { id },
    });
  }
}
