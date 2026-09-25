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

    // Default jika belum pernah tercatat: RT Basic (Free)
    const rt = await this.prisma.rT.findUnique({
      where: { id: rtId },
      include: { rw: { include: { kelurahan: true } } },
    });

    const defaultSub: RtSubscriptionRecord = {
      rtId,
      nomorRt: rt?.nomor || '03',
      nomorRw: rt?.rw?.nomor || '05',
      kelurahan: rt?.rw?.kelurahan?.nama || 'Sukamaju',
      paket: 'BASIC',
      status: 'TIDAK_AKTIF',
      activatedAt: new Date().toISOString(),
      expiredAt: null,
      updatedAt: new Date().toISOString(),
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
      const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      expiredAt = exp.toISOString();
    } else if (data.status === 'TRIAL') {
      const days = data.durationDays || 14;
      const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
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
}
