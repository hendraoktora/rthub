import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, StatusTagihan, TipeKas } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class WilayahService {
  constructor(private prisma: PrismaService) {}

  async getKelurahanList() {
    return this.prisma.kelurahan.findMany({
      include: {
        _count: { select: { rws: true } },
      },
      orderBy: { nama: 'asc' },
    });
  }

  async getRwByKelurahan(kelurahanId: string) {
    return this.prisma.rW.findMany({
      where: { kelurahanId },
      include: {
        _count: { select: { rts: true } },
      },
      orderBy: { nomor: 'asc' },
    });
  }

  async getRtByRw(rwId: string) {
    return this.prisma.rT.findMany({
      where: { rwId },
      include: {
        _count: { select: { users: true, rumah: true } },
      },
      orderBy: { nomor: 'asc' },
    });
  }

  // Superadmin: Get all registered RTs across all RW and Kelurahan in real-time
  async getAllRtSummary() {
    const rts = await this.prisma.rT.findMany({
      include: {
        rw: {
          include: {
            kelurahan: true,
          },
        },
        users: {
          where: { role: Role.ADMIN_RT },
          include: { profile: true },
        },
        _count: {
          select: {
            users: true,
            rumah: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const results = await Promise.all(
      rts.map(async (rt) => {
        const totalIn = await this.prisma.kasRT.aggregate({
          where: { rtId: rt.id, tipe: TipeKas.PEMASUKAN },
          _sum: { nominal: true },
        });
        const totalOut = await this.prisma.kasRT.aggregate({
          where: { rtId: rt.id, tipe: TipeKas.PENGELUARAN },
          _sum: { nominal: true },
        });

        const sumIn = Number(totalIn._sum.nominal || 0);
        const sumOut = Number(totalOut._sum.nominal || 0);
        const saldoKas = sumIn - sumOut;

        const ketua = rt.users[0]?.profile?.namaLengkap || 'Ketua RT Aktif';
        const phone = rt.users[0]?.phone || '-';

        return {
          id: rt.id,
          nomor: rt.nomor,
          namaJalan: rt.namaJalan || `RT ${rt.nomor}`,
          rwNomor: rt.rw.nomor,
          kelurahanNama: rt.rw.kelurahan.nama,
          kota: rt.rw.kelurahan.kota || 'Depok',
          label: `RT ${rt.nomor} / RW ${rt.rw.nomor} (${rt.rw.kelurahan.nama})`,
          wargaCount: rt._count.users > 0 ? rt._count.users : (rt._count.rumah || 1),
          rumahCount: rt._count.rumah,
          ketua,
          phone,
          saldoKas,
          createdAt: rt.createdAt,
        };
      }),
    );

    return results;
  }

  // Get all warga under specific RT
  async getWargaByRt(rtId: string) {
    if (!rtId) {
      return {
        totalRumah: 0,
        totalWarga: 0,
        rumahList: [],
        userList: [],
      };
    }

    const rumahList = await this.prisma.rumah.findMany({
      where: { rtId },
      include: {
        kartuKeluarga: {
          include: {
            anggota: true,
          },
        },
        tagihanWarga: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { noRumah: 'asc' },
    });

    const users = await this.prisma.user.findMany({
      where: { rtId },
      include: {
        profile: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      totalRumah: rumahList.length,
      totalWarga: users.length,
      rumahList,
      userList: users.map(u => {
        const { passwordHash, ...rest } = u;
        return rest;
      }),
    };
  }

  // Add warga directly by RT Admin / Pengurus
  async addWargaToRt(rtId: string, data: {
    namaLengkap: string;
    phone: string;
    noRumah: string;
    nik?: string;
    noKk?: string;
    statusHunian?: string;
    namaIstri?: string;
    anggotaKeluarga?: string[];
  }) {
    // 1. Check existing phone
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: data.phone.trim() },
    });
    if (existingUser) {
      throw new ConflictException('Nomor WhatsApp warga sudah terdaftar di sistem.');
    }

    const rt = await this.prisma.rT.findUnique({
      where: { id: rtId },
      include: { rw: true },
    });
    if (!rt) {
      throw new BadRequestException('Data RT tidak ditemukan.');
    }

    // 2. Find or create Rumah
    let rumah = await this.prisma.rumah.findFirst({
      where: {
        rtId,
        noRumah: data.noRumah.trim(),
      },
    });

    if (!rumah) {
      rumah = await this.prisma.rumah.create({
        data: {
          rtId,
          noRumah: data.noRumah.trim(),
          alamatLengkap: `${data.noRumah.trim()}, RT ${rt.nomor}/RW ${rt.rw.nomor}`,
          statusHunian: data.statusHunian || 'TETAP',
        },
      });
    }

    // 3. Create User & Profile
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const user = await this.prisma.user.create({
      data: {
        phone: data.phone.trim(),
        passwordHash,
        role: Role.WARGA,
        rtId: rt.id,
        rwId: rt.rwId,
        kelurahanId: rt.rw.kelurahanId,
        profile: {
          create: {
            namaLengkap: data.namaLengkap.trim(),
            noRumah: data.noRumah.trim(),
            nik: data.nik?.trim() || null,
            noKk: data.noKk?.trim() || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // 4. Create Kartu Keluarga if noKk is provided
    if (data.noKk && data.noKk.trim().length > 0) {
      const existingKk = await this.prisma.kartuKeluarga.findUnique({
        where: { noKk: data.noKk.trim() },
      });

      if (!existingKk) {
        const anggotaToCreate = [
          {
            nama: data.namaLengkap.trim(),
            nik: data.nik?.trim() || null,
            hubungan: 'KEPALA_KELUARGA',
            noHp: data.phone.trim(),
          },
        ];

        if (data.namaIstri && data.namaIstri.trim().length > 0) {
          anggotaToCreate.push({
            nama: data.namaIstri.trim(),
            nik: null,
            hubungan: 'ISTRI',
            noHp: null,
          });
        }

        if (data.anggotaKeluarga && data.anggotaKeluarga.length > 0) {
          for (const namaAnak of data.anggotaKeluarga) {
            if (namaAnak.trim().length > 0) {
              anggotaToCreate.push({
                nama: namaAnak.trim(),
                nik: null,
                hubungan: 'ANAK',
                noHp: null,
              });
            }
          }
        }

        await this.prisma.kartuKeluarga.create({
          data: {
            noKk: data.noKk.trim(),
            rumahId: rumah.id,
            namaKepala: data.namaLengkap.trim(),
            anggota: {
              create: anggotaToCreate,
            },
          },
        });
      }
    }

    // 5. Create default tagihan for current month
    const masterTagihan = await this.prisma.masterTagihan.findFirst({
      where: { rtId: rt.id, isActive: true },
    });

    if (masterTagihan) {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      await this.prisma.tagihanWarga.create({
        data: {
          masterTagihanId: masterTagihan.id,
          rumahId: rumah.id,
          periodeBulan: currentMonth,
          periodeTahun: currentYear,
          nominalPokok: masterTagihan.nominalPokok,
          adminFee: masterTagihan.adminFee,
          totalBayar: Number(masterTagihan.nominalPokok) + Number(masterTagihan.adminFee),
          status: StatusTagihan.UNPAID,
          jatuhTempo: new Date(currentYear, currentMonth - 1, 10),
        },
      });
    }

    const { passwordHash: _, ...sanitized } = user;
    return {
      message: 'Warga baru berhasil ditambahkan ke RT!',
      user: sanitized,
      rumah,
    };
  }

  // Pengurus Management
  async getPengurusByRt(rtId: string) {
    if (!rtId) return [];

    const users = await this.prisma.user.findMany({
      where: {
        rtId,
        role: { in: [Role.ADMIN_RT, Role.SEKRETARIS_RT, Role.BENDAHARA_RT, Role.SECURITY, Role.ADMIN_RW] },
      },
      include: { profile: true },
      orderBy: { role: 'asc' },
    });

    return users.map(u => {
      const { passwordHash, ...rest } = u;
      let jabatan = 'Pengurus RT';
      if (u.role === Role.ADMIN_RT) jabatan = 'Ketua RT';
      else if (u.role === Role.SEKRETARIS_RT) jabatan = 'Sekretaris RT';
      else if (u.role === Role.BENDAHARA_RT) jabatan = 'Bendahara RT';
      else if (u.role === Role.SECURITY) jabatan = 'Petugas Keamanan / Satpam';
      else if (u.role === Role.ADMIN_RW) jabatan = 'Ketua RW';

      return {
        ...rest,
        jabatan,
        nama: u.profile?.namaLengkap || 'Pengurus RT',
        noRumah: u.profile?.noRumah || '-',
      };
    });
  }

  async addOrUpdatePengurus(rtId: string, data: {
    namaLengkap: string;
    phone: string;
    role: Role;
    noRumah?: string;
    email?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { phone: data.phone.trim() },
      include: { profile: true },
    });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password123!', salt);
      const rt = await this.prisma.rT.findUnique({ where: { id: rtId }, include: { rw: true } });
      if (!rt) throw new BadRequestException('RT tidak ditemukan');

      user = await this.prisma.user.create({
        data: {
          phone: data.phone.trim(),
          email: data.email?.trim() || null,
          passwordHash,
          role: data.role || Role.ADMIN_RT,
          rtId: rt.id,
          rwId: rt.rwId,
          kelurahanId: rt.rw.kelurahanId,
          profile: {
            create: {
              namaLengkap: data.namaLengkap.trim(),
              noRumah: data.noRumah?.trim() || 'Blok Pengurus',
            },
          },
        },
        include: { profile: true },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          role: data.role || Role.ADMIN_RT,
          rtId,
          profile: {
            upsert: {
              create: {
                namaLengkap: data.namaLengkap.trim(),
                noRumah: data.noRumah?.trim() || 'Blok Pengurus',
              },
              update: {
                namaLengkap: data.namaLengkap.trim(),
                noRumah: data.noRumah?.trim() || user.profile?.noRumah,
              },
            },
          },
        },
        include: { profile: true },
      });
    }

    const { passwordHash: _, ...sanitized } = user;
    return sanitized;
  }

  async deletePengurus(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.WARGA },
    });
  }
}
