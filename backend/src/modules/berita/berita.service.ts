import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';

@Injectable()
export class BeritaService {
  constructor(private prisma: PrismaService) {}

  // Multi-tier hierarchical news feed (Kelurahan + RW + RT)
  async getFeed(user: any) {
    return this.prisma.berita.findMany({
      where: {
        OR: [
          { scope: ScopeWilayah.RT, rtId: user.rtId },
          { scope: ScopeWilayah.RW, rwId: user.rwId },
          { scope: ScopeWilayah.KELURAHAN, kelurahanId: user.kelurahanId },
        ],
      },
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
