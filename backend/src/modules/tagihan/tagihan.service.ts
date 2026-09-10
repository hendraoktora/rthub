import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusTagihan, PaymentMethod, PaymentStatus, TipeKas } from '@prisma/client';

@Injectable()
export class TagihanService {
  constructor(private prisma: PrismaService) {}

  // Master Tagihan untuk RT
  async getMasterTagihan(rtId: string) {
    return this.prisma.masterTagihan.findMany({
      where: { rtId, isActive: true },
    });
  }

  // Atur / Ubah Tarif Master Tagihan (Bendahara / Admin RT)
  async setMasterTagihan(rtId: string, data: { namaTagihan?: string; nominalPokok: number; deskripsi?: string }) {
    const existing = await this.prisma.masterTagihan.findFirst({
      where: { rtId, isActive: true },
    });

    if (existing) {
      return this.prisma.masterTagihan.update({
        where: { id: existing.id },
        data: {
          ...(data.namaTagihan ? { namaTagihan: data.namaTagihan } : {}),
          nominalPokok: data.nominalPokok,
          ...(data.deskripsi !== undefined ? { deskripsi: data.deskripsi } : {}),
        },
      });
    }

    return this.prisma.masterTagihan.create({
      data: {
        rtId,
        namaTagihan: data.namaTagihan || 'Iuran Kas & Kebersihan',
        nominalPokok: data.nominalPokok,
        deskripsi: data.deskripsi || 'Iuran wajib bulanan warga RT',
      },
    });
  }

  // Generate tagihan bulanan untuk semua rumah di RT
  async generateTagihanBulanan(rtId: string, masterTagihanId: string, bulan: number, tahun: number) {
    const master = await this.prisma.masterTagihan.findUnique({
      where: { id: masterTagihanId },
    });
    if (!master || master.rtId !== rtId) {
      throw new NotFoundException('Master tagihan tidak ditemukan.');
    }

    const rumahList = await this.prisma.rumah.findMany({
      where: { rtId },
    });

    const jatuhTempo = new Date(tahun, bulan - 1, 10); // Jatuh tempo tanggal 10 tiap bulan
    let createdCount = 0;

    for (const rumah of rumahList) {
      const existing = await this.prisma.tagihanWarga.findUnique({
        where: {
          masterTagihanId_rumahId_periodeBulan_periodeTahun: {
            masterTagihanId: master.id,
            rumahId: rumah.id,
            periodeBulan: bulan,
            periodeTahun: tahun,
          },
        },
      });

      if (!existing) {
        const adminFee = Number(process.env.DEFAULT_ADMIN_FEE || 2000);
        const nominalPokok = Number(master.nominalPokok);
        const totalBayar = nominalPokok + adminFee;

        await this.prisma.tagihanWarga.create({
          data: {
            masterTagihanId: master.id,
            rumahId: rumah.id,
            periodeBulan: bulan,
            periodeTahun: tahun,
            nominalPokok,
            adminFee,
            totalBayar,
            status: StatusTagihan.UNPAID,
            jatuhTempo,
          },
        });
        createdCount++;
      }
    }

    return {
      message: `Berhasil menerbitkan tagihan untuk ${createdCount} rumah.`,
      bulan,
      tahun,
      nominalPokok: master.nominalPokok,
      adminFee: process.env.DEFAULT_ADMIN_FEE || 2000,
    };
  }

  // Mendapatkan tagihan untuk warga yang login
  async getTagihanSaya(user: any) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile || !profile.noRumah) {
      return [];
    }

    const rumah = await this.prisma.rumah.findFirst({
      where: {
        rtId: user.rtId,
        noRumah: profile.noRumah,
      },
    });

    if (!rumah) {
      return [];
    }

    return this.prisma.tagihanWarga.findMany({
      where: { rumahId: rumah.id },
      include: {
        masterTagihan: true,
        transaksi: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: [{ periodeTahun: 'desc' }, { periodeBulan: 'desc' }],
    });
  }

  // Proses simulasi pembayaran iuran & split fee admin
  async bayarTagihan(tagihanId: string, userId: string, paymentMethod: PaymentMethod) {
    const tagihan = await this.prisma.tagihanWarga.findUnique({
      where: { id: tagihanId },
      include: { masterTagihan: true, rumah: true },
    });

    if (!tagihan) {
      throw new NotFoundException('Tagihan tidak ditemukan.');
    }

    if (tagihan.status === StatusTagihan.PAID) {
      throw new BadRequestException('Tagihan ini sudah lunas.');
    }

    // 1. Buat Transaksi Pembayaran
    const transaksi = await this.prisma.transaksiPembayaran.create({
      data: {
        tagihanId: tagihan.id,
        userId,
        nominalPokok: tagihan.nominalPokok,
        adminFee: tagihan.adminFee,
        totalBayar: tagihan.totalBayar,
        paymentMethod,
        status: PaymentStatus.SUCCESS, // Simulasi instant settlement
        paidAt: new Date(),
      },
    });

    // 2. Update status Tagihan menjadi PAID
    await this.prisma.tagihanWarga.update({
      where: { id: tagihan.id },
      data: {
        status: StatusTagihan.PAID,
        paidAt: new Date(),
      },
    });

    // 3. Catat Hak Platform di SystemFeeLog
    await this.prisma.systemFeeLog.create({
      data: {
        transaksiId: transaksi.id,
        rtId: tagihan.rumah.rtId,
        nominalFee: tagihan.adminFee,
        isSettled: false,
      },
    });

    // 4. Catat Hak Kas RT di KasRT (Otomatis Kas Masuk)
    const currentKas = await this.prisma.kasRT.findFirst({
      where: { rtId: tagihan.rumah.rtId },
      orderBy: { createdAt: 'desc' },
    });
    const currentSaldo = currentKas ? Number(currentKas.saldoBerjalan) : 0;
    const newSaldo = currentSaldo + Number(tagihan.nominalPokok);

    await this.prisma.kasRT.create({
      data: {
        rtId: tagihan.rumah.rtId,
        createdById: userId,
        tipe: TipeKas.PEMASUKAN,
        kategori: 'Iuran Warga (Digital)',
        nominal: tagihan.nominalPokok,
        saldoBerjalan: newSaldo,
        keterangan: `Pembayaran ${tagihan.masterTagihan.namaTagihan} Periode ${tagihan.periodeBulan}/${tagihan.periodeTahun} - Rumah ${tagihan.rumah.noRumah}`,
      },
    });

    return {
      message: 'Pembayaran iuran berhasil diproses!',
      rincian: {
        tagihan: tagihan.masterTagihan.namaTagihan,
        nominalIuranPokokMasukKasRT: tagihan.nominalPokok,
        biayaLayananAdminPlatform: tagihan.adminFee,
        totalBayar: tagihan.totalBayar,
        metodeBayar: paymentMethod,
        status: 'PAID / LUNAS',
      },
    };
  }
}
