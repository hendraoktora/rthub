import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';

@Injectable()
export class BeritaService {
  constructor(private prisma: PrismaService) {}

  async getFeed(user: any) {
    const orConditions: any[] = [];
    if (user?.rtId) orConditions.push({ scope: ScopeWilayah.RT, rtId: user.rtId });
    if (user?.rwId) orConditions.push({ scope: ScopeWilayah.RW, rwId: user.rwId });
    if (user?.kelurahanId) orConditions.push({ scope: ScopeWilayah.KELURAHAN, kelurahanId: user.kelurahanId });

    return this.prisma.berita.findMany({
      where: orConditions.length > 0 ? { OR: orConditions } : {},
      include: {
        author: { select: { profile: { select: { namaLengkap: true } }, role: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createBerita(user: any, data: { judul: string; konten: string; scope: ScopeWilayah; coverUrl?: string; isPinned?: boolean }) {
    return this.prisma.berita.create({
      data: {
        authorId: user.id,
        judul: data.judul,
        konten: data.konten,
        scope: data.scope,
        rtId: data.scope === ScopeWilayah.RT ? user.rtId : null,
        rwId: data.scope === ScopeWilayah.RW ? user.rwId : null,
        kelurahanId: data.scope === ScopeWilayah.KELURAHAN ? user.kelurahanId : null,
        coverUrl: data.coverUrl || null,
        isPinned: data.isPinned ?? false,
      },
    });
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
