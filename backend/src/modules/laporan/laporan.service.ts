import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusLaporan, Role } from '@prisma/client';

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  async createLaporan(user: any, data: {
    judul: string;
    deskripsi: string;
    kategori?: string;
    fotoUrl?: string;
    isAnonymous?: boolean;
    tujuan?: string;
    tipeLaporan?: string;
    dataSurat?: any;
  }) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { rt: { include: { rw: true } } },
    });
    const rtId = dbUser?.rtId || user?.rtId;
    const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
    const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;

    if (!rtId) {
      throw new BadRequestException('Akun Anda belum terdaftar dalam unit RT manapun.');
    }

    const dataSuratString = data.dataSurat
      ? typeof data.dataSurat === 'object'
        ? JSON.stringify(data.dataSurat)
        : String(data.dataSurat)
      : null;

    return this.prisma.laporanWarga.create({
      data: {
        userId: user.id,
        rtId: rtId,
        rwId: rwId || null,
        kelurahanId: kelurahanId || null,
        judul: data.judul,
        deskripsi: data.deskripsi || '',
        kategori: data.kategori || 'FASILITAS_UMUM',
        fotoUrl: data.fotoUrl || null,
        isAnonymous: Boolean(data.isAnonymous),
        status: StatusLaporan.PENDING,
        tujuan: data.tujuan || 'KETUA_RT',
        tipeLaporan: data.tipeLaporan || 'PENGADUAN',
        dataSurat: dataSuratString,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            profile: {
              select: {
                namaLengkap: true,
                noRumah: true,
                nik: true,
              },
            },
          },
        },
      },
    });
  }

  async getLaporanList(user: any) {
    if (user?.role === Role.SUPERADMIN) {
      return this.prisma.laporanWarga.findMany({
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              profile: {
                select: {
                  namaLengkap: true,
                  noRumah: true,
                  nik: true,
                },
              },
            },
          },
          rt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    if (!user?.rtId) {
      return [];
    }

    // STRICT PRIVACY RULES:
    // 1. Regular WARGA can only see their own reports
    if (user.role === Role.WARGA) {
      return this.prisma.laporanWarga.findMany({
        where: {
          rtId: user.rtId,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              profile: {
                select: {
                  namaLengkap: true,
                  noRumah: true,
                  nik: true,
                },
              },
            },
          },
          rt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    // 2. SECURITY / Ronda: sees reports aimed at KEAMANAN or UMUM or created by them
    if (user.role === Role.SECURITY) {
      return this.prisma.laporanWarga.findMany({
        where: {
          rtId: user.rtId,
          OR: [
            { tujuan: 'KEAMANAN' },
            { tujuan: 'UMUM' },
            { userId: user.id },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              profile: {
                select: {
                  namaLengkap: true,
                  noRumah: true,
                  nik: true,
                },
              },
            },
          },
          rt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    // 3. BENDAHARA_RT: sees reports aimed at BENDAHARA_RT or UMUM or created by them
    if (user.role === Role.BENDAHARA_RT) {
      return this.prisma.laporanWarga.findMany({
        where: {
          rtId: user.rtId,
          OR: [
            { tujuan: 'BENDAHARA_RT' },
            { tujuan: 'UMUM' },
            { userId: user.id },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              profile: {
                select: {
                  namaLengkap: true,
                  noRumah: true,
                  nik: true,
                },
              },
            },
          },
          rt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    // 4. SEKRETARIS_RT: sees administrative/surat requests, SEKRETARIS_RT, UMUM, or own
    if (user.role === Role.SEKRETARIS_RT) {
      return this.prisma.laporanWarga.findMany({
        where: {
          rtId: user.rtId,
          OR: [
            { tujuan: 'SEKRETARIS_RT' },
            { tujuan: 'UMUM' },
            { tipeLaporan: { not: 'PENGADUAN' } },
            { userId: user.id },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              profile: {
                select: {
                  namaLengkap: true,
                  noRumah: true,
                  nik: true,
                },
              },
            },
          },
          rt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    // 5. ADMIN_RT (Ketua RT): can monitor all reports in their RT
    return this.prisma.laporanWarga.findMany({
      where: {
        rtId: user.rtId,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            profile: {
              select: {
                namaLengkap: true,
                noRumah: true,
                nik: true,
              },
            },
          },
        },
        rt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async updateStatus(
    user: any,
    laporanId: string,
    data: {
      status: StatusLaporan;
      tanggapanRT?: string;
      tanggapanBy?: string;
      nomorSurat?: string;
    },
  ) {
    const laporan = await this.prisma.laporanWarga.findUnique({
      where: { id: laporanId },
      include: { rt: true },
    });

    if (!laporan) {
      throw new NotFoundException('Laporan atau permohonan surat tidak ditemukan.');
    }

    let mappedStatus: StatusLaporan;
    const rawStatus = String(data.status || '').toUpperCase();
    if (rawStatus === 'SELESAI' || rawStatus === 'RESOLVED' || rawStatus === 'SELESAIKAN') {
      mappedStatus = StatusLaporan.RESOLVED;
    } else if (rawStatus === 'DIPROSES' || rawStatus === 'IN_PROGRESS' || rawStatus === 'PROSES') {
      mappedStatus = StatusLaporan.IN_PROGRESS;
    } else if (rawStatus === 'DITOLAK' || rawStatus === 'REJECTED' || rawStatus === 'TOLAK') {
      mappedStatus = StatusLaporan.REJECTED;
    } else if (rawStatus === 'PENDING' || rawStatus === 'MENUNGGU') {
      mappedStatus = StatusLaporan.PENDING;
    } else {
      mappedStatus = (rawStatus as StatusLaporan) || StatusLaporan.RESOLVED;
    }

    // Strict Response Permission Check:
    const userRole = user?.role;
    const isSuperAdmin = userRole === Role.SUPERADMIN;
    const isKetuaRT = userRole === Role.ADMIN_RT && laporan.rtId === user.rtId;
    const isSekretaris = userRole === Role.SEKRETARIS_RT && (laporan.tujuan === 'SEKRETARIS_RT' || laporan.tujuan === 'UMUM' || laporan.tipeLaporan !== 'PENGADUAN');
    const isBendahara = userRole === Role.BENDAHARA_RT && (laporan.tujuan === 'BENDAHARA_RT' || laporan.tujuan === 'UMUM');
    const isSecurity = userRole === Role.SECURITY && (laporan.tujuan === 'KEAMANAN' || laporan.tujuan === 'UMUM');

    if (!isSuperAdmin && !isKetuaRT && !isSekretaris && !isBendahara && !isSecurity) {
      throw new ForbiddenException(
        'Hanya pihak yang ditunjuk atau Ketua RT yang memiliki wewenang untuk memberikan tanggapan atau menyelesaikan laporan ini.',
      );
    }

    // Auto-generate official letter registration number if resolving a letter request
    let nomorSurat = data.nomorSurat || laporan.nomorSurat;
    if (mappedStatus === StatusLaporan.RESOLVED && !nomorSurat && laporan.tipeLaporan !== 'PENGADUAN') {
      const currentYear = new Date().getFullYear();
      const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      const romanMonth = romanMonths[new Date().getMonth()];
      const randomSeq = String(Math.floor(100 + Math.random() * 900));
      nomorSurat = `470/${randomSeq}/RT.${laporan.rt?.nomor || '03'}-RW.05/${romanMonth}/${currentYear}`;
    }

    const responderName =
      data.tanggapanBy ||
      (user?.profile?.namaLengkap ? `${user.profile.namaLengkap} (${user.role})` : user?.phone || 'Pengurus RT');

    return this.prisma.laporanWarga.update({
      where: { id: laporanId },
      data: {
        status: mappedStatus,
        tanggapanRT: data.tanggapanRT || null,
        tanggapanBy: responderName,
        nomorSurat: nomorSurat || null,
        respondedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            profile: {
              select: {
                namaLengkap: true,
                noRumah: true,
                nik: true,
              },
            },
          },
        },
        rt: true,
      },
    });
  }
}
