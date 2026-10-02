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
        const adminFee = Number(process.env.DEFAULT_ADMIN_FEE || 1500);
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
      adminFee: process.env.DEFAULT_ADMIN_FEE || 1500,
    };
  }

  // Mendapatkan tagihan untuk warga yang login (auto-generate jika belum ada)
  async getTagihanSaya(user: any) {
    if (!user) return [];

    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const rtId = user.rtId || (await this.prisma.rT.findFirst({ select: { id: true } }))?.id;
    if (!rtId) return [];

    let rumah: any = null;
    if (profile?.noRumah) {
      rumah = await this.prisma.rumah.findFirst({
        where: {
          rtId,
          noRumah: profile.noRumah,
        },
      });
    }

    if (!rumah) {
      rumah = await this.prisma.rumah.findFirst({
        where: { rtId },
      });
    }

    if (!rumah) {
      const defaultNo = profile?.noRumah || 'Blok A No. 1';
      rumah = await this.prisma.rumah.create({
        data: {
          rtId,
          noRumah: defaultNo,
          alamatLengkap: `Rumah ${defaultNo}`,
        },
      });
      if (profile && !profile.noRumah) {
        await this.prisma.profile.update({
          where: { id: profile.id },
          data: { noRumah: defaultNo },
        });
      }
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Pastikan master tagihan aktif di-generate untuk rumah ini jika belum ada
    let masters = await this.prisma.masterTagihan.findMany({
      where: { rtId, isActive: true },
    });

    if (masters.length === 0) {
      const newMaster = await this.prisma.masterTagihan.create({
        data: {
          rtId,
          namaTagihan: 'Iuran Pengelolaan Lingkungan (IPL)',
          nominalPokok: 50000.00,
          adminFee: 0.00,
          deskripsi: 'Iuran kas bulanan operasional keamanan dan kebersihan lingkungan',
          isActive: true,
        },
      });
      masters = [newMaster];
    }

    for (const master of masters) {
      const existing = await this.prisma.tagihanWarga.findFirst({
        where: {
          masterTagihanId: master.id,
          rumahId: rumah.id,
          periodeBulan: currentMonth,
          periodeTahun: currentYear,
        },
      });

      if (!existing) {
        const jatuhTempo = new Date(currentYear, currentMonth - 1, 10);
        await this.prisma.tagihanWarga.create({
          data: {
            masterTagihanId: master.id,
            rumahId: rumah.id,
            periodeBulan: currentMonth,
            periodeTahun: currentYear,
            nominalPokok: master.nominalPokok,
            adminFee: 0,
            totalBayar: master.nominalPokok,
            status: StatusTagihan.UNPAID,
            jatuhTempo,
          },
        });
      }
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

  // Mendapatkan rincian tagihan beserta nomor rekening & QRIS RT untuk dibayar warga
  async getInstruksiBayar(tagihanId: string) {
    let tagihan = await this.prisma.tagihanWarga.findUnique({
      where: { id: tagihanId },
      include: {
        masterTagihan: true,
        rumah: {
          include: {
            rt: {
              select: {
                id: true,
                nomor: true,
                namaBank: true,
                nomorRekening: true,
                atasNamaRekening: true,
                qrisImageUrl: true,
              },
            },
          },
        },
        transaksi: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!tagihan) {
      tagihan = await this.prisma.tagihanWarga.findFirst({
        include: {
          masterTagihan: true,
          rumah: {
            include: {
              rt: {
                select: {
                  id: true,
                  nomor: true,
                  namaBank: true,
                  nomorRekening: true,
                  atasNamaRekening: true,
                  qrisImageUrl: true,
                },
              },
            },
          },
          transaksi: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
    }

    if (!tagihan) {
      throw new NotFoundException('Tagihan tidak ditemukan.');
    }

    return {
      tagihanId: tagihan.id,
      namaTagihan: tagihan.masterTagihan.namaTagihan,
      periode: `${tagihan.periodeBulan}/${tagihan.periodeTahun}`,
      nominal: Number(tagihan.nominalPokok),
      status: tagihan.status,
      rumah: `No. ${tagihan.rumah.noRumah}`,
      jatuhTempo: tagihan.jatuhTempo,
      rekeningRT: {
        namaBank: tagihan.rumah.rt.namaBank || 'BCA (Belum diatur)',
        nomorRekening: tagihan.rumah.rt.nomorRekening || 'Belum diisi pengurus',
        atasNamaRekening: tagihan.rumah.rt.atasNamaRekening || `Kas RT ${tagihan.rumah.rt.nomor}`,
        qrisImageUrl: tagihan.rumah.rt.qrisImageUrl || null,
      },
      transaksiTerakhir: tagihan.transaksi[0] || null,
    };
  }

  // Warga konfirmasi pembayaran (Upload bukti transfer / QRIS atau pilih tunai)
  async konfirmasiBayarWarga(
    tagihanId: string,
    userId: string,
    data: { paymentMethod: PaymentMethod; buktiBayarUrl?: string; catatan?: string },
  ) {
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

    const transaksi = await this.prisma.transaksiPembayaran.create({
      data: {
        tagihanId: tagihan.id,
        userId,
        nominalPokok: tagihan.nominalPokok,
        adminFee: 0,
        totalBayar: tagihan.nominalPokok,
        paymentMethod: data.paymentMethod || PaymentMethod.QRIS,
        status: PaymentStatus.PENDING,
        buktiBayarUrl: data.buktiBayarUrl || null,
        referenceId: `TF-${Date.now()}`,
      },
    });

    await this.prisma.tagihanWarga.update({
      where: { id: tagihan.id },
      data: { status: StatusTagihan.PENDING },
    });

    return {
      message: 'Konfirmasi pembayaran berhasil dikirim. Menunggu verifikasi bendahara RT.',
      transaksiId: transaksi.id,
      status: 'PENDING',
    };
  }

  // Bendahara RT menerima pembayaran tunai fisik langsung
  async terimaTunai(tagihanId: string, bendaharaUserId: string) {
    const tagihan = await this.prisma.tagihanWarga.findUnique({
      where: { id: tagihanId },
      include: { masterTagihan: true, rumah: true },
    });

    if (!tagihan) {
      throw new NotFoundException('Tagihan tidak ditemukan.');
    }

    if (tagihan.status === StatusTagihan.PAID) {
      throw new BadRequestException('Tagihan sudah lunas.');
    }

    // 1. Buat record transaksi cash
    const transaksi = await this.prisma.transaksiPembayaran.create({
      data: {
        tagihanId: tagihan.id,
        userId: bendaharaUserId,
        nominalPokok: tagihan.nominalPokok,
        adminFee: 0,
        totalBayar: tagihan.nominalPokok,
        paymentMethod: PaymentMethod.CASH,
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
      },
    });

    // 2. Set tagihan PAID
    await this.prisma.tagihanWarga.update({
      where: { id: tagihan.id },
      data: { status: StatusTagihan.PAID, paidAt: new Date() },
    });

    // 3. Masukkan otomatis ke Kas RT (Metode: TUNAI)
    const currentKas = await this.prisma.kasRT.findFirst({
      where: { rtId: tagihan.rumah.rtId },
      orderBy: { createdAt: 'desc' },
    });
    const currentSaldo = currentKas ? Number(currentKas.saldoBerjalan) : 0;
    const newSaldo = currentSaldo + Number(tagihan.nominalPokok);

    await this.prisma.kasRT.create({
      data: {
        rtId: tagihan.rumah.rtId,
        createdById: bendaharaUserId,
        tipe: TipeKas.PEMASUKAN,
        metodeKas: 'TUNAI',
        kategori: 'Iuran Warga (Tunai)',
        nominal: tagihan.nominalPokok,
        saldoBerjalan: newSaldo,
        keterangan: `Pembayaran Tunai ${tagihan.masterTagihan.namaTagihan} Periode ${tagihan.periodeBulan}/${tagihan.periodeTahun} - Rumah ${tagihan.rumah.noRumah} (Diterima Bendahara)`,
      },
    });

    return {
      message: 'Pembayaran tunai berhasil dicatat dan masuk ke Saldo Kas Tunai RT.',
      tagihanId: tagihan.id,
      nominal: tagihan.nominalPokok,
      status: 'PAID',
    };
  }

  // Bendahara RT menyetujui (Approve) bukti transfer / QRIS dari warga
  async approveTransaksi(transaksiId: string, bendaharaUserId: string) {
    const transaksi = await this.prisma.transaksiPembayaran.findUnique({
      where: { id: transaksiId },
      include: {
        tagihan: {
          include: { masterTagihan: true, rumah: true },
        },
        user: {
          include: { profile: true },
        },
      },
    });

    if (!transaksi) {
      throw new NotFoundException('Transaksi tidak ditemukan.');
    }

    if (transaksi.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Transaksi ini sudah disetujui sebelumnya.');
    }

    // 1. Update status transaksi
    await this.prisma.transaksiPembayaran.update({
      where: { id: transaksi.id },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
      },
    });

    // 2. Update status tagihan
    await this.prisma.tagihanWarga.update({
      where: { id: transaksi.tagihanId },
      data: {
        status: StatusTagihan.PAID,
        paidAt: new Date(),
      },
    });

    // 3. Masukkan otomatis ke Kas RT (Metode: BANK)
    const currentKas = await this.prisma.kasRT.findFirst({
      where: { rtId: transaksi.tagihan.rumah.rtId },
      orderBy: { createdAt: 'desc' },
    });
    const currentSaldo = currentKas ? Number(currentKas.saldoBerjalan) : 0;
    const newSaldo = currentSaldo + Number(transaksi.nominalPokok);

    const caraBayar = transaksi.paymentMethod === PaymentMethod.QRIS ? 'QRIS RT' : 'Transfer Bank';

    await this.prisma.kasRT.create({
      data: {
        rtId: transaksi.tagihan.rumah.rtId,
        createdById: bendaharaUserId,
        tipe: TipeKas.PEMASUKAN,
        metodeKas: 'BANK',
        kategori: `Iuran Warga (${caraBayar})`,
        nominal: transaksi.nominalPokok,
        saldoBerjalan: newSaldo,
        keterangan: `Pembayaran ${transaksi.tagihan.masterTagihan.namaTagihan} Periode ${transaksi.tagihan.periodeBulan}/${transaksi.tagihan.periodeTahun} - Rumah ${transaksi.tagihan.rumah.noRumah} via ${caraBayar} (Dikonfirmasi Bendahara)`,
      },
    });

    return {
      message: `Pembayaran via ${caraBayar} berhasil disetujui dan masuk ke Saldo Kas Bank RT.`,
      status: 'SUCCESS',
    };
  }

  // Daftar pembayaran yang menunggu approval bendahara RT
  async getPendingVerifikasi(rtId: string) {
    return this.prisma.transaksiPembayaran.findMany({
      where: {
        status: PaymentStatus.PENDING,
        tagihan: {
          rumah: { rtId },
        },
      },
      include: {
        tagihan: {
          include: {
            masterTagihan: true,
            rumah: true,
          },
        },
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Proses simulasi pembayaran iuran langsung
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

    const isCash = paymentMethod === PaymentMethod.CASH;

    // 1. Buat Transaksi Pembayaran
    const transaksi = await this.prisma.transaksiPembayaran.create({
      data: {
        tagihanId: tagihan.id,
        userId,
        nominalPokok: tagihan.nominalPokok,
        adminFee: 0,
        totalBayar: tagihan.nominalPokok,
        paymentMethod,
        status: PaymentStatus.SUCCESS,
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

    // 3. Catat Hak Kas RT di KasRT
    const currentKas = await this.prisma.kasRT.findFirst({
      where: { rtId: tagihan.rumah.rtId },
      orderBy: { createdAt: 'desc' },
    });
    const currentSaldo = currentKas ? Number(currentKas.saldoBerjalan) : 0;
    const newSaldo = currentSaldo + Number(tagihan.nominalPokok);

    const kategori = isCash ? 'Iuran Warga (Tunai)' : `Iuran Warga (${paymentMethod})`;
    const caraBayar = isCash ? 'secara Tunai ke Bendahara' : `via ${paymentMethod}`;

    await this.prisma.kasRT.create({
      data: {
        rtId: tagihan.rumah.rtId,
        createdById: userId,
        tipe: TipeKas.PEMASUKAN,
        metodeKas: isCash ? 'TUNAI' : 'BANK',
        kategori,
        nominal: tagihan.nominalPokok,
        saldoBerjalan: newSaldo,
        keterangan: `Pembayaran ${tagihan.masterTagihan.namaTagihan} Periode ${tagihan.periodeBulan}/${tagihan.periodeTahun} - Rumah ${tagihan.rumah.noRumah} (${caraBayar})`,
      },
    });

    return {
      message: 'Pembayaran iuran berhasil diproses!',
      rincian: {
        tagihan: tagihan.masterTagihan.namaTagihan,
        nominalIuranPokokMasukKasRT: tagihan.nominalPokok,
        totalBayar: tagihan.totalBayar,
        metodeBayar: paymentMethod,
        status: 'PAID / LUNAS',
      },
    };
  }
}
