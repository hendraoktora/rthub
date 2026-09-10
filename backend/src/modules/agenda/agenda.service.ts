import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';

@Injectable()
export class AgendaService {
  constructor(private prisma: PrismaService) {}

  async getAgenda(user: any) {
    const orConditions: any[] = [];
    if (user?.rtId) orConditions.push({ scope: ScopeWilayah.RT, rtId: user.rtId });
    if (user?.rwId) orConditions.push({ scope: ScopeWilayah.RW, rwId: user.rwId });
    if (user?.kelurahanId) orConditions.push({ scope: ScopeWilayah.KELURAHAN, kelurahanId: user.kelurahanId });

    return this.prisma.agendaKegiatan.findMany({
      where: orConditions.length > 0 ? { OR: orConditions } : {},
      orderBy: { tanggalMulai: 'asc' },
    });
  }

  async createAgenda(user: any, data: {
    judul: string;
    kategori: string;
    deskripsi?: string;
    tanggalMulai: string;
    tanggalSelesai?: string;
    lokasi?: string;
    scope?: ScopeWilayah;
  }) {
    const scope = data.scope || ScopeWilayah.RT;
    return this.prisma.agendaKegiatan.create({
      data: {
        judul: data.judul,
        kategori: data.kategori || 'KERJA_BAKTI',
        deskripsi: data.deskripsi || null,
        tanggalMulai: new Date(data.tanggalMulai),
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        lokasi: data.lokasi || null,
        scope,
        rtId: scope === ScopeWilayah.RT ? user.rtId : null,
        rwId: scope === ScopeWilayah.RW ? user.rwId : null,
        kelurahanId: scope === ScopeWilayah.KELURAHAN ? user.kelurahanId : null,
      },
    });
  }

  async updateAgenda(id: string, user: any, data: {
    judul?: string;
    kategori?: string;
    deskripsi?: string;
    tanggalMulai?: string;
    tanggalSelesai?: string;
    lokasi?: string;
  }) {
    return this.prisma.agendaKegiatan.update({
      where: { id },
      data: {
        ...(data.judul ? { judul: data.judul } : {}),
        ...(data.kategori ? { kategori: data.kategori } : {}),
        ...(data.deskripsi !== undefined ? { deskripsi: data.deskripsi } : {}),
        ...(data.tanggalMulai ? { tanggalMulai: new Date(data.tanggalMulai) } : {}),
        ...(data.tanggalSelesai !== undefined
          ? { tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null }
          : {}),
        ...(data.lokasi !== undefined ? { lokasi: data.lokasi } : {}),
      },
    });
  }

  async deleteAgenda(id: string, user: any) {
    return this.prisma.agendaKegiatan.delete({
      where: { id },
    });
  }
}
