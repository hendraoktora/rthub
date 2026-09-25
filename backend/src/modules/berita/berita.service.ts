import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BeritaService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async getFeed(user: any) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { rt: { include: { rw: true } } },
    });
    const rtId = dbUser?.rtId || user?.rtId;
    const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
    const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;

    const orConditions: any[] = [];
    if (rtId && rwId && kelurahanId) {
      orConditions.push({ scope: ScopeWilayah.RT, rtId, rwId, kelurahanId });
    } else if (rtId) {
      orConditions.push({ scope: ScopeWilayah.RT, rtId });
    }

    if (rwId && kelurahanId) {
      orConditions.push({ scope: ScopeWilayah.RW, rwId, kelurahanId });
    } else if (rwId) {
      orConditions.push({ scope: ScopeWilayah.RW, rwId });
    }

    if (kelurahanId) {
      orConditions.push({ scope: ScopeWilayah.KELURAHAN, kelurahanId });
    }

    if (orConditions.length === 0) {
      return [];
    }

    return this.prisma.berita.findMany({
      where: { OR: orConditions },
      include: {
        author: { select: { profile: { select: { namaLengkap: true } }, role: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createBerita(user: any, data: { judul: string; konten: string; scope: ScopeWilayah; coverUrl?: string; isPinned?: boolean }) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { rt: { include: { rw: true } } },
    });
    const rtId = dbUser?.rtId || user?.rtId;
    const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
    const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;

    const berita = await this.prisma.berita.create({
      data: {
        authorId: user.id,
        judul: data.judul,
        konten: data.konten,
        scope: data.scope,
        rtId: rtId || null,
        rwId: rwId || null,
        kelurahanId: kelurahanId || null,
        coverUrl: data.coverUrl || null,
        isPinned: data.isPinned ?? false,
      },
    });

    // Kirim Push Notification ke seluruh warga (Broadcast & RT)
    try {
      const snippet = data.konten.replace(/<[^>]*>?/gm, '').trim();
      const bodyPreview = snippet.length > 120 ? `${snippet.substring(0, 117)}...` : snippet;
      
      // Kirim Push Notification sesuai scope wilayah (hindari notifikasi ganda)
      if (data.scope === ScopeWilayah.RT && user.rtId) {
        // Kirim HANYA ke channel RT pelapor/pengurus
        await this.notificationService.sendToTopic(
          `rt_${user.rtId}`,
          `📢 ${data.judul}`,
          bodyPreview || 'Ada pengumuman lingkungan baru untuk warga RT Anda.',
          {
            type: 'BERITA',
            beritaId: berita.id,
            scope: data.scope,
          },
        );
      } else if (data.scope === ScopeWilayah.RW && user.rwId) {
        // Kirim ke channel RW
        await this.notificationService.sendToTopic(
          `rw_${user.rwId}`,
          `📢 ${data.judul}`,
          bodyPreview || 'Ada pengumuman lingkungan baru untuk warga RW Anda.',
          {
            type: 'BERITA',
            beritaId: berita.id,
            scope: data.scope,
          },
        );
      } else {
        // Lingkup Kelurahan / Umum: kirim ke broadcast channel aplikasi
        await this.notificationService.sendToTopic(
          'rthub_broadcast',
          `📢 ${data.judul}`,
          bodyPreview || 'Ada pengumuman lingkungan baru untuk warga.',
          {
            type: 'BERITA',
            beritaId: berita.id,
            scope: data.scope,
          },
        );
      }
    } catch (_) {}

    return berita;
  }

  async updateBerita(id: string, user: any, data: {
    judul?: string;
    konten?: string;
    scope?: ScopeWilayah;
    coverUrl?: string;
    isPinned?: boolean;
  }) {
    return this.prisma.berita.update({
      where: { id },
      data: {
        ...(data.judul ? { judul: data.judul } : {}),
        ...(data.konten ? { konten: data.konten } : {}),
        ...(data.scope ? {
          scope: data.scope,
          rtId: data.scope === ScopeWilayah.RT ? user.rtId : null,
          rwId: data.scope === ScopeWilayah.RW ? user.rwId : null,
          kelurahanId: data.scope === ScopeWilayah.KELURAHAN ? user.kelurahanId : null,
        } : {}),
        ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
        ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
      },
    });
  }

  async deleteBerita(id: string, user: any) {
    return this.prisma.berita.delete({
      where: { id },
    });
  }
}
