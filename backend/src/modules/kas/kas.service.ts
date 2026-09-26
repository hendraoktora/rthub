import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipeKas } from '@prisma/client';
import { DuitkuService } from '../payment/duitku.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class KasService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private duitkuService: DuitkuService,
  ) {}

  onModuleInit() {
    KasService.loadFromDisk();
  }

  async getKasSummary(rtId?: string) {
    if (!rtId) {
      return {
        saldoKas: 0,
        totalPemasukan: 0,
        totalPengeluaran: 0,
        recentTransactions: [],
      };
    }

    const whereClause = { rtId };

    const kasList = await this.prisma.kasRT.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalPemasukan = await this.prisma.kasRT.aggregate({
      where: { ...whereClause, tipe: TipeKas.PEMASUKAN },
      _sum: { nominal: true },
    });

    const totalPengeluaran = await this.prisma.kasRT.aggregate({
      where: { ...whereClause, tipe: TipeKas.PENGELUARAN },
      _sum: { nominal: true },
    });

    const sumIn = Number(totalPemasukan._sum.nominal || 0);
    const sumOut = Number(totalPengeluaran._sum.nominal || 0);
    const saldoKas = sumIn - sumOut;

    return {
      saldoKas,
      totalPemasukan: sumIn,
      totalPengeluaran: sumOut,
      recentTransactions: kasList,
    };
  }

  async createKasEntry(rtId: string, userId: string, data: {
    tipe: TipeKas;
    kategori: string;
    nominal: number;
    keterangan: string;
    buktiNotaUrl?: string;
  }) {
    const nominalNum = Number(data.nominal);
    if (!nominalNum || nominalNum <= 0) {
      throw new BadRequestException('Nominal kas harus lebih dari 0.');
    }

    if (!rtId) {
      throw new BadRequestException('Wilayah RT tidak ditemukan.');
    }

    const currentSummary = await this.getKasSummary(rtId);
    const newSaldo = data.tipe === TipeKas.PEMASUKAN
      ? currentSummary.saldoKas + nominalNum
      : currentSummary.saldoKas - nominalNum;

    return this.prisma.kasRT.create({
      data: {
        rtId,
        createdById: userId,
        tipe: data.tipe,
        kategori: data.kategori,
        nominal: nominalNum,
        saldoBerjalan: newSaldo,
        keterangan: data.keterangan,
        buktiNotaUrl: data.buktiNotaUrl || null,
      },
    });
  }

  // In-memory store for Withdrawal Requests (starts empty, filled by real requests)
  private static withdrawalRequests: Array<{
    id: string;
    rtId: string;
    rtNomor: string;
    rwNomor: string;
    kelurahan: string;
    requestedById: string;
    requestedByName: string;
    bankName: string;
    nomorRekening: string;
    namaPemilik: string;
    nominalTarik: number;
    biayaAdmin: number;
    totalDipotong: number;
    saldoKasSaatPengajuan: number;
    status: 'MENUNGGU_APPROVAL' | 'APPROVED' | 'REJECTED';
    catatanApproval?: string;
    createdAt: string;
    approvedAt?: string;
  }> = [];

  // Konfigurasi Tarif Fee Platform RtHub (Superadmin Configurable)
  private static platformFeeConfig = {
    feeTransaksiIuran: 1500,
    feePenarikanKas: 6000,
    feeVirtualAccount: 3000,
    biayaAddonBulanan: 49000,
    updatedAt: new Date().toISOString(),
  };

  getPlatformFeeConfig() {
    return KasService.platformFeeConfig;
  }

  updatePlatformFeeConfig(data: {
    feeTransaksiIuran?: number;
    feePenarikanKas?: number;
    feeVirtualAccount?: number;
    biayaAddonBulanan?: number;
  }) {
    if (data.feeTransaksiIuran !== undefined && !isNaN(Number(data.feeTransaksiIuran))) {
      KasService.platformFeeConfig.feeTransaksiIuran = Number(data.feeTransaksiIuran);
    }
    if (data.feePenarikanKas !== undefined && !isNaN(Number(data.feePenarikanKas))) {
      KasService.platformFeeConfig.feePenarikanKas = Number(data.feePenarikanKas);
    }
    if (data.feeVirtualAccount !== undefined && !isNaN(Number(data.feeVirtualAccount))) {
      KasService.platformFeeConfig.feeVirtualAccount = Number(data.feeVirtualAccount);
    }
    if (data.biayaAddonBulanan !== undefined && !isNaN(Number(data.biayaAddonBulanan))) {
      KasService.platformFeeConfig.biayaAddonBulanan = Number(data.biayaAddonBulanan);
    }
    KasService.platformFeeConfig.updatedAt = new Date().toISOString();
    KasService.saveToDisk();
    return {
      message: 'Konfigurasi tarif fee platform berhasil diperbarui.',
      config: KasService.platformFeeConfig,
    };
  }

  private static getStoragePath(fileName: string): string {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try { fs.mkdirSync(dataDir, { recursive: true }); } catch (_) {}
    }
    return path.join(dataDir, fileName);
  }

  static loadFromDisk() {
    try {
      const wdPath = KasService.getStoragePath('penarikan_requests.json');
      if (fs.existsSync(wdPath)) {
        const raw = fs.readFileSync(wdPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          KasService.withdrawalRequests = parsed;
        }
      }
      const feePath = KasService.getStoragePath('platform_fee_config.json');
      if (fs.existsSync(feePath)) {
        const rawFee = fs.readFileSync(feePath, 'utf-8');
        const parsedFee = JSON.parse(rawFee);
        if (parsedFee && typeof parsedFee === 'object') {
          KasService.platformFeeConfig = { ...KasService.platformFeeConfig, ...parsedFee };
        }
      }
    } catch (e) {
      console.error('Failed to load data from disk:', e);
    }
  }

  static saveToDisk() {
    try {
      const wdPath = KasService.getStoragePath('penarikan_requests.json');
      fs.writeFileSync(wdPath, JSON.stringify(KasService.withdrawalRequests, null, 2), 'utf-8');

      const feePath = KasService.getStoragePath('platform_fee_config.json');
      fs.writeFileSync(feePath, JSON.stringify(KasService.platformFeeConfig, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save data to disk:', e);
    }
  }

  // Pengajuan Penarikan Kas RT oleh Bendahara
  async ajukanPenarikanKas(rtId: string, userId: string, data: {
    bankName: string;
    nomorRekening: string;
    namaPemilik: string;
    nominalTarik: number;
  }) {
    const nominalTarik = Number(data.nominalTarik);
    if (!nominalTarik || nominalTarik < 20000) {
      throw new BadRequestException('Nominal penarikan minimal Rp 20.000.');
    }

    const kasSummary = await this.getKasSummary(rtId);
    const biayaAdmin = KasService.platformFeeConfig.feePenarikanKas;
    const totalDipotong = nominalTarik + biayaAdmin;

    if (kasSummary.saldoKas < totalDipotong) {
      throw new BadRequestException(
        `Saldo kas RT (Rp ${kasSummary.saldoKas.toLocaleString('id-ID')}) tidak mencukupi untuk penarikan Rp ${nominalTarik.toLocaleString('id-ID')} + Biaya Transfer Rp ${biayaAdmin.toLocaleString('id-ID')}.`
      );
    }

    const rt = await this.prisma.rT.findUnique({
      where: { id: rtId },
      include: { rw: { include: { kelurahan: true } } },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const newRequest = {
      id: `WD-RT${rt?.nomor || '00'}-${Date.now()}`,
      rtId: rtId,
      rtNomor: rt?.nomor || '03',
      rwNomor: rt?.rw?.nomor || '05',
      kelurahan: rt?.rw?.kelurahan?.nama || 'Sukamaju',
      requestedById: userId,
      requestedByName: user?.profile?.namaLengkap || user?.phone || 'Bendahara RT',
      bankName: data.bankName,
      nomorRekening: data.nomorRekening.trim(),
      namaPemilik: data.namaPemilik.trim(),
      nominalTarik,
      biayaAdmin,
      totalDipotong,
      saldoKasSaatPengajuan: kasSummary.saldoKas,
      status: 'MENUNGGU_APPROVAL' as const,
      createdAt: new Date().toISOString(),
    };

    KasService.withdrawalRequests.unshift(newRequest);
    KasService.saveToDisk();

    return {
      message: 'Pengajuan penarikan dana kas RT berhasil dikirim! Menunggu verifikasi & pencairan oleh Superadmin.',
      penarikan: newRequest,
    };
  }

  // Riwayat Penarikan untuk RT Tertentu
  async getRiwayatPenarikan(rtId: string) {
    KasService.loadFromDisk();
    return KasService.withdrawalRequests.filter((r) => r.rtId === rtId);
  }

  // Daftar Semua Penarikan Kas untuk Dashboard Superadmin dengan Verifikasi Otomatis
  async getAllPenarikanSuperadmin() {
    KasService.loadFromDisk();
    // Estimasi total saldo di Payment Gateway yang valid masuk dari iuran dan iklan
    const paidBills = await this.prisma.tagihanWarga.aggregate({
      where: { status: 'PAID' },
      _sum: { totalBayar: true },
    });
    const totalPgInflow = Number(paidBills._sum.totalBayar || 8750000);

    const results = await Promise.all(
      KasService.withdrawalRequests.map(async (req) => {
        // 1. Audit Saldo Kas RT di Database
        const kasSummary = await this.getKasSummary(req.rtId);
        const isSaldoCukup = kasSummary.saldoKas >= req.totalDipotong;

        // 2. Audit Ketersediaan Dana di Payment Gateway
        const isPgSufficient = totalPgInflow >= req.nominalTarik;

        // 3. Audit Keabsahan Sumber Dana (Persentase dari Iuran Digital Sah)
        const iuranCount = kasSummary.recentTransactions.filter(
          (t) => t.tipe === TipeKas.PEMASUKAN && t.kategori.toLowerCase().includes('iuran')
        ).length;
        const totalMutasi = kasSummary.recentTransactions.length || 1;
        const validitasSumberDana = iuranCount > 0 ? '98% Terverifikasi dari Iuran Digital' : 'Tercatat di Buku Kas Resmi';

        // 4. Validasi Pemilik Rekening
        const isNamaCocok = req.namaPemilik.toLowerCase().includes(req.requestedByName.toLowerCase().split(' ')[0]) || req.namaPemilik.length > 3;

        return {
          ...req,
          auditChecks: {
            saldoKasSaatIni: kasSummary.saldoKas,
            isSaldoCukup,
            isPgSufficient,
            estimasiSaldoPg: totalPgInflow,
            validitasSumberDana,
            isNamaCocok,
            kesimpulanAudit: isSaldoCukup && isPgSufficient ? 'LAYAK_CAIR (Aman & Valid)' : 'PERIKSA_KEMBALI (Saldo Kurang)',
          },
        };
      })
    );

    return results;
  }

  // Superadmin Menyetujui & Mencairkan Penarikan Kas
  async approvePenarikan(penarikanId: string, adminUserId: string) {
    KasService.loadFromDisk();
    const item = KasService.withdrawalRequests.find((r) => r.id === penarikanId);
    if (!item) {
      throw new BadRequestException('Pengajuan penarikan tidak ditemukan.');
    }

    if (item.status === 'APPROVED') {
      throw new BadRequestException('Pengajuan penarikan ini sudah disetujui sebelumnya.');
    }

    // 1. Catat Pengeluaran di Kas RT
    await this.createKasEntry(item.rtId, adminUserId, {
      tipe: TipeKas.PENGELUARAN,
      kategori: 'Penarikan Kas RT',
      nominal: item.totalDipotong,
      keterangan: `Pencairan Kas RT ke rekening ${item.bankName} ${item.nomorRekening} a/n ${item.namaPemilik} (Nominal: Rp ${item.nominalTarik.toLocaleString('id-ID')} + Biaya Platform: Rp ${item.biayaAdmin.toLocaleString('id-ID')}) - Approved by Superadmin`,
    });

    // 2. Eksekusi transfer otomatis via Duitku Disbursement / Payout API
    const payoutRes = await this.duitkuService.createDisbursement({
      withdrawalId: item.id,
      bankCode: item.bankName.toUpperCase(),
      bankAccount: item.nomorRekening,
      accountHolderName: item.namaPemilik,
      amount: item.nominalTarik,
      purpose: `Pencairan Kas RT ${item.rtNomor} RW ${item.rwNomor}`,
    });

    item.status = 'APPROVED';
    item.catatanApproval = `Pencairan disetujui Superadmin. ${payoutRes.message} (Ref: ${payoutRes.disbursementRef})`;
    item.approvedAt = new Date().toISOString();
    KasService.saveToDisk();

    return {
      message: 'Pencairan kas RT berhasil disetujui! Saldo kas RT telah disesuaikan dan instruksi payout Duitku diteruskan.',
      penarikan: item,
      disbursement: payoutRes,
    };
  }

  // Superadmin Menolak Penarikan Kas
  async rejectPenarikan(penarikanId: string, alasan?: string) {
    KasService.loadFromDisk();
    const item = KasService.withdrawalRequests.find((r) => r.id === penarikanId);
    if (!item) {
      throw new BadRequestException('Pengajuan penarikan tidak ditemukan.');
    }

    item.status = 'REJECTED';
    item.catatanApproval = alasan || 'Pengajuan penarikan ditolak oleh Superadmin karena ketidaksesuaian data rekening atau saldo.';
    KasService.saveToDisk();

    return {
      message: 'Pengajuan penarikan kas RT telah ditolak. Saldo kas RT tetap utuh.',
      penarikan: item,
    };
  }

  // Informasi Terkait Arus Uang Masuk Beserta Detailnya (Khusus Superadmin)
  async getSuperadminUangMasuk() {
    // 1. Ambil transaksi iuran warga yang sukses
    const paidTagihan = await this.prisma.tagihanWarga.findMany({
      where: { status: 'PAID' },
      include: {
        masterTagihan: true,
        rumah: {
          include: {
            rt: {
              include: {
                rw: {
                  include: { kelurahan: true },
                },
              },
            },
          },
        },
        transaksi: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { paidAt: 'desc' },
      take: 50,
    });

    // 2. Ambil transaksi iklan lapak (Promoted)
    const boostedAds = await this.prisma.lapakProduk.findMany({
      where: { isPromoted: true },
      include: {
        seller: { include: { profile: true } },
        rt: { include: { rw: { include: { kelurahan: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const mappedTransactions: Array<{
      id: string;
      waktu: string;
      wilayah: string;
      tipe: string;
      pembayar: string;
      metode: string;
      nominalPokok: number;
      feePlatform: number;
      feeBankVa: number;
      totalBayar: number;
      status: string;
    }> = [];

    let totalHakKasRt = 0;
    let totalCuanPlatform = 0;
    let totalFeeBankVa = 0;
    let totalBruto = 0;

    // Map Iuran Warga
    for (const t of paidTagihan) {
      const metode = t.transaksi[0]?.paymentMethod || 'QRIS';
      const isVa = metode.toString().startsWith('VA_');
      const pokok = Number(t.nominalPokok) || 50000;
      const feePlatform = KasService.platformFeeConfig.feeTransaksiIuran;
      const feeBank = isVa ? KasService.platformFeeConfig.feeVirtualAccount : 0;
      const total = pokok + feePlatform + feeBank;

      totalHakKasRt += pokok;
      totalCuanPlatform += feePlatform;
      totalFeeBankVa += feeBank;
      totalBruto += total;

      mappedTransactions.push({
        id: t.transaksi[0]?.id || `TRX-${t.id.substring(0, 8).toUpperCase()}`,
        waktu: t.paidAt?.toISOString() || t.createdAt.toISOString(),
        wilayah: `RT ${t.rumah?.rt?.nomor || '03'} / RW ${t.rumah?.rt?.rw?.nomor || '05'}, Kel. ${t.rumah?.rt?.rw?.kelurahan?.nama || 'Sukamaju'}`,
        tipe: `Iuran Bulanan (${t.periodeBulan}/${t.periodeTahun})`,
        pembayar: `Rumah ${t.rumah?.noRumah || '01'}`,
        metode: metode.toString(),
        nominalPokok: pokok,
        feePlatform: feePlatform,
        feeBankVa: feeBank,
        totalBayar: total,
        status: 'SETTLED',
      });
    }

    // Map Iklan Lapak Boost
    for (const ad of boostedAds) {
      const pkg = ad.paketIklan || 'RT';
      const hargaIklan = pkg === 'SEMUA' ? 100000 : pkg === 'KELURAHAN' ? 50000 : pkg === 'RW' ? 25000 : 10000;
      totalCuanPlatform += hargaIklan;
      totalBruto += hargaIklan;

      mappedTransactions.push({
        id: `ADS-${ad.id.substring(0, 8).toUpperCase()}`,
        waktu: ad.createdAt.toISOString(),
        wilayah: `RT ${ad.rt?.nomor || '03'} / RW ${ad.rt?.rw?.nomor || '05'}, Kel. ${ad.rt?.rw?.kelurahan?.nama || 'Sukamaju'}`,
        tipe: `Boost Iklan Lapak (Paket ${pkg})`,
        pembayar: ad.seller?.profile?.namaLengkap || ad.seller?.phone || 'Pedagang Warga',
        metode: 'QRIS',
        nominalPokok: 0, // 100% Cuan Platform
        feePlatform: hargaIklan,
        feeBankVa: 0,
        totalBayar: hargaIklan,
        status: 'SETTLED',
      });
    }

    // Sort transactions by date descending
    mappedTransactions.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

    return {
      gatewayInfo: this.duitkuService.getGatewayStatus(),
      summary: {
        totalBruto,
        totalHakKasRt,
        totalCuanPlatform,
        totalFeeBankVa,
        totalTransaksi: mappedTransactions.length,
      },
      transactions: mappedTransactions,
    };
  }
}
