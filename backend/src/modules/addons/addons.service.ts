import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export interface RtSubscriptionRecord {
  rtId: string;
  nomorRt?: string;
  nomorRw?: string;
  kelurahan?: string;
  paket: 'BASIC' | 'PRO';
  status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF';
  activatedAt: string;
  expiredAt: string | null;
  updatedAt: string;
  updatedBy?: string;
}

@Injectable()
export class AddonsService {
  private readonly logger = new Logger(AddonsService.name);
  private static subscriptions: Record<string, RtSubscriptionRecord> = {};

  constructor(private prisma: PrismaService) {
    AddonsService.loadFromDisk();
  }

  private static getStoragePath(): string {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (_) {}
    }
    return path.join(dataDir, 'rt_subscriptions.json');
  }

  static loadFromDisk() {
    try {
      const filePath = AddonsService.getStoragePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          AddonsService.subscriptions = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load RT subscriptions from disk:', e);
    }
  }

  static saveToDisk() {
    try {
      const filePath = AddonsService.getStoragePath();
      fs.writeFileSync(
        filePath,
        JSON.stringify(AddonsService.subscriptions, null, 2),
        'utf-8',
      );
    } catch (e) {
      console.error('Failed to save RT subscriptions to disk:', e);
    }
  }

  // Cek apakah fitur Pro RT aktif (untuk surat digital, kas manual resi WA, LPJ ekspor)
  async isRtProActive(rtId: string): Promise<boolean> {
    if (!rtId) return false;
    const sub = await this.getRtSubscription(rtId);
    if (!sub) return false;

    if (sub.status === 'TIDAK_AKTIF' || sub.paket !== 'PRO') {
      return false;
    }

    if (sub.expiredAt) {
      const expireTime = new Date(sub.expiredAt).getTime();
      const now = Date.now();
      if (now > expireTime) {
        // Otomatis tandai expired jika sudah lewat waktu
        sub.status = 'TIDAK_AKTIF';
        AddonsService.subscriptions[rtId] = sub;
        AddonsService.saveToDisk();
        return false;
      }
    }

    return true;
  }

  // Ambil data langganan per RT
  async getRtSubscription(rtId: string): Promise<RtSubscriptionRecord> {
    if (AddonsService.subscriptions[rtId]) {
      const existing = AddonsService.subscriptions[rtId];
      if (existing.expiredAt && new Date(existing.expiredAt).getTime() < Date.now()) {
        existing.status = 'TIDAK_AKTIF';
        AddonsService.saveToDisk();
      }
      return existing;
    }

    // Default jika belum pernah tercatat: Trial 7 Hari (Full Pro Akses)
    const rt = await this.prisma.rT.findUnique({
      where: { id: rtId },
      include: { rw: { include: { kelurahan: true } } },
    });

    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const defaultSub: RtSubscriptionRecord = {
      rtId,
      nomorRt: rt?.nomor || '03',
      nomorRw: rt?.rw?.nomor || '05',
      kelurahan: rt?.rw?.kelurahan?.nama || 'Sukamaju',
      paket: 'PRO',
      status: 'TRIAL',
      activatedAt: now.toISOString(),
      expiredAt: trialExpiry.toISOString(),
      updatedAt: now.toISOString(),
    };

    AddonsService.subscriptions[rtId] = defaultSub;
    AddonsService.saveToDisk();
    return defaultSub;
  }

  // Ambil semua status langganan RT di database untuk Superadmin
  async getAllRtSubscriptions() {
    const allRts = await this.prisma.rT.findMany({
      include: {
        rw: { include: { kelurahan: true } },
        users: {
          take: 1,
          include: { profile: true },
        },
        _count: {
          select: { users: true, rumah: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return allRts.map((rt) => {
      let sub = AddonsService.subscriptions[rt.id];
      if (!sub) {
        sub = {
          rtId: rt.id,
          nomorRt: rt.nomor,
          nomorRw: rt.rw?.nomor || '01',
          kelurahan: rt.rw?.kelurahan?.nama || '-',
          paket: 'BASIC',
          status: 'TIDAK_AKTIF',
          activatedAt: rt.createdAt.toISOString(),
          expiredAt: null,
          updatedAt: rt.createdAt.toISOString(),
        };
        AddonsService.subscriptions[rt.id] = sub;
      }

      // Check expiry
      if (sub.expiredAt && new Date(sub.expiredAt).getTime() < Date.now()) {
        sub.status = 'TIDAK_AKTIF';
      }

      const ketua = rt.users[0]?.profile?.namaLengkap || 'Pengurus RT';
      const phone = rt.users[0]?.phone || '-';

      return {
        ...sub,
        rtNomor: rt.nomor,
        rwNomor: rt.rw?.nomor || '-',
        kelurahan: rt.rw?.kelurahan?.nama || '-',
        kota: rt.rw?.kelurahan?.kota || 'Depok',
        namaJalan: rt.namaJalan || `RT ${rt.nomor}`,
        ketua,
        phone,
        wargaCount: rt._count.users,
        rumahCount: rt._count.rumah,
      };
    });
  }

  // Superadmin mengaktifkan / mengubah paket RT
  async updateSubscription(
    rtId: string,
    data: {
      status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF';
      paket?: 'BASIC' | 'PRO';
      durationDays?: number;
      updatedBy?: string;
    },
  ) {
    const existing = await this.getRtSubscription(rtId);

    const now = new Date();
    let expiredAt: string | null = null;

    if (data.status === 'AKTIF') {
      const days = data.durationDays || 30;
      // Probis Akumulasi Durasi: Jika langganan masih aktif, sisa durasi ditambah durasi baru
      const isCurrentlyActive = existing.status === 'AKTIF' && existing.expiredAt && new Date(existing.expiredAt).getTime() > now.getTime();
      const baseTime = isCurrentlyActive ? new Date(existing.expiredAt!).getTime() : now.getTime();
      const exp = new Date(baseTime + days * 24 * 60 * 60 * 1000);
      expiredAt = exp.toISOString();
    } else if (data.status === 'TRIAL') {
      const days = data.durationDays || 14;
      const isCurrentlyTrial = existing.status === 'TRIAL' && existing.expiredAt && new Date(existing.expiredAt).getTime() > now.getTime();
      const baseTime = isCurrentlyTrial ? new Date(existing.expiredAt!).getTime() : now.getTime();
      const exp = new Date(baseTime + days * 24 * 60 * 60 * 1000);
      expiredAt = exp.toISOString();
    } else {
      expiredAt = null;
    }

    const updated: RtSubscriptionRecord = {
      ...existing,
      paket: data.status === 'TIDAK_AKTIF' ? 'BASIC' : (data.paket || 'PRO'),
      status: data.status,
      expiredAt,
      updatedAt: now.toISOString(),
      updatedBy: data.updatedBy || 'SUPERADMIN',
    };

    AddonsService.subscriptions[rtId] = updated;
    AddonsService.saveToDisk();

    return updated;
  }

  // Summary status keanggotaan akun, langganan RT Pro, sisa masa aktif, dan iklan sponsor warga
  async getMyMembershipAndAdsSummary(userId: string, rtId?: string) {
    const now = new Date();
    let subscriptionInfo: any = null;

    if (rtId) {
      const sub = await this.getRtSubscription(rtId);
      const isPro = await this.isRtProActive(rtId);
      
      let sisaHari = 0;
      let isExpiringSoon = false;
      let isExpired = false;

      if (sub.expiredAt) {
        const expTime = new Date(sub.expiredAt).getTime();
        const diffMs = expTime - now.getTime();
        if (diffMs > 0) {
          sisaHari = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
          if (sisaHari <= 5) {
            isExpiringSoon = true;
          }
        } else {
          isExpired = true;
        }
      } else if (sub.status === 'TIDAK_AKTIF') {
        isExpired = true;
      }

      subscriptionInfo = {
        ...sub,
        isPro,
        sisaHari,
        isExpiringSoon,
        isExpired,
        renewalFee: 99000,
      };
    }

    // Ambil produk & status iklan milik user ini
    const myLapak = await this.prisma.lapakProduk.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    const userAds = myLapak.map((p) => {
      const isPromoted = Boolean(p.isPromoted && p.promotedUntil && new Date(p.promotedUntil) > now);
      let sisaHariIklan = 0;
      let isExpiringSoon = false;
      let isExpired = false;

      if (p.promotedUntil) {
        const expTime = new Date(p.promotedUntil).getTime();
        const diffMs = expTime - now.getTime();
        if (diffMs > 0) {
          sisaHariIklan = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
          if (sisaHariIklan <= 3) {
            isExpiringSoon = true;
          }
        } else {
          isExpired = true;
        }
      }

      return {
        id: p.id,
        judul: p.judul,
        harga: Number(p.harga),
        fotoUrl: p.fotoUrl,
        isPromoted,
        promotedBadge: p.promotedBadge,
        paketIklan: p.paketIklan,
        promotedUntil: p.promotedUntil ? p.promotedUntil.toISOString() : null,
        sisaHariIklan,
        isExpiringSoon,
        isExpired,
      };
    });

    // Alert Banner dinamis yang siap langsung dirender di frontend
    const alerts: Array<{
      id: string;
      type: 'SUBSCRIPTION' | 'ADS' | 'TRIAL_EXPIRING' | 'RT_DEACTIVATED';
      severity: 'warning' | 'danger' | 'info';
      title: string;
      message: string;
      actionText: string;
      meta?: any;
    }> = [];

    if (subscriptionInfo && rtId) {
      const isTrial = subscriptionInfo.status === 'TRIAL';
      const isExpired = subscriptionInfo.isExpired;

      if (isExpired) {
        subscriptionInfo.isDeactivated = true;
        // Probis: jika durasi habis, otomatis nonaktifkan RT dan seluruh akses akun RT
        if (AddonsService.subscriptions[rtId]) {
          AddonsService.subscriptions[rtId].status = 'TIDAK_AKTIF';
          AddonsService.saveToDisk();
        }

        alerts.push({
          id: 'alert-rt-deactivated',
          type: 'RT_DEACTIVATED',
          severity: 'danger',
          title: 'Akun RT Dinonaktifkan Otomatis',
          message: `Masa aktif ${isTrial ? 'Trial 7 Hari' : 'Langganan Pro'} RT Anda telah berakhir. Seluruh isi dan fitur akun di RT ini dinonaktifkan sementara. Segera lakukan pembayaran Pro Rp 99.000 / bln untuk mengaktifkan kembali seluruh akun RT.`,
          actionText: 'Aktifkan Akun RT (Rp 99rb)',
          meta: { rtId },
        });
      } else if (isTrial && subscriptionInfo.sisaHari <= 3) {
        // H-3 Trial habis: tampilkan banner peringatan upgrade ke Pro
        alerts.push({
          id: 'alert-trial-expiring',
          type: 'TRIAL_EXPIRING',
          severity: 'warning',
          title: `Masa Trial RT Pro Tersisa ${subscriptionInfo.sisaHari} Hari!`,
          message: `Masa uji coba gratis RT Pro Anda tersisa ${subscriptionInfo.sisaHari} hari lagi. Segera upgrade ke akun Pro (Rp 99.000 / bln) agar akun RT dan seluruh data warga tidak dinonaktifkan otomatis.`,
          actionText: 'Upgrade ke Pro (Rp 99rb)',
          meta: { rtId, sisaHari: subscriptionInfo.sisaHari },
        });
      } else if (!isTrial && subscriptionInfo.isExpiringSoon) {
        alerts.push({
          id: 'alert-sub-expiring',
          type: 'SUBSCRIPTION',
          severity: 'warning',
          title: 'Masa Aktif Pro Segera Berakhir',
          message: `Langganan RTHub Pro RT Anda tersisa ${subscriptionInfo.sisaHari} hari lagi. Perpanjang sekarang agar akses surat digital & kas RT tidak terputus.`,
          actionText: 'Perpanjang (Rp 99rb)',
          meta: { rtId, sisaHari: subscriptionInfo.sisaHari },
        });
      }
    }

    userAds.forEach((ad) => {
      if (ad.isExpiringSoon) {
        alerts.push({
          id: `alert-ad-expiring-${ad.id}`,
          type: 'ADS',
          severity: 'warning',
          title: 'Iklan Sponsor Segera Berakhir',
          message: `Masa tayang iklan "${ad.judul}" tersisa ${ad.sisaHariIklan} hari lagi. Perpanjang durasi agar produk tetap berada di posisi prioritas.`,
          actionText: 'Tambah Durasi Iklan',
          meta: { lapakId: ad.id, judul: ad.judul, sisaHari: ad.sisaHariIklan },
        });
      } else if (ad.isExpired && ad.isPromoted) {
        alerts.push({
          id: `alert-ad-expired-${ad.id}`,
          type: 'ADS',
          severity: 'info',
          title: 'Masa Tayang Iklan Selesai',
          message: `Iklan sponsor untuk "${ad.judul}" telah selesai tayang. Pasang iklan kembali untuk memaksimalkan promosi ke warga.`,
          actionText: 'Pasang Iklan Lagi',
          meta: { lapakId: ad.id, judul: ad.judul },
        });
      }
    });

    return {
      subscription: subscriptionInfo,
      userAds,
      alerts,
    };
  }
}
