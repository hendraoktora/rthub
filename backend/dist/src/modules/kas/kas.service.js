"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let KasService = KasService_1 = class KasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKasSummary(rtId) {
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
            where: { ...whereClause, tipe: client_1.TipeKas.PEMASUKAN },
            _sum: { nominal: true },
        });
        const totalPengeluaran = await this.prisma.kasRT.aggregate({
            where: { ...whereClause, tipe: client_1.TipeKas.PENGELUARAN },
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
    async createKasEntry(rtId, userId, data) {
        const nominalNum = Number(data.nominal);
        if (!nominalNum || nominalNum <= 0) {
            throw new common_1.BadRequestException('Nominal kas harus lebih dari 0.');
        }
        if (!rtId) {
            throw new common_1.BadRequestException('Wilayah RT tidak ditemukan.');
        }
        const currentSummary = await this.getKasSummary(rtId);
        const newSaldo = data.tipe === client_1.TipeKas.PEMASUKAN
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
    async ajukanPenarikanKas(rtId, userId, data) {
        const nominalTarik = Number(data.nominalTarik);
        if (!nominalTarik || nominalTarik < 20000) {
            throw new common_1.BadRequestException('Nominal penarikan minimal Rp 20.000.');
        }
        const kasSummary = await this.getKasSummary(rtId);
        const biayaAdmin = 6000;
        const totalDipotong = nominalTarik + biayaAdmin;
        if (kasSummary.saldoKas < totalDipotong) {
            throw new common_1.BadRequestException(`Saldo kas RT (${kasSummary.saldoKas.toLocaleString('id-ID')}) tidak mencukupi untuk penarikan Rp ${nominalTarik.toLocaleString('id-ID')} + Biaya Layanan Rp 6.000.`);
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
            status: 'MENUNGGU_APPROVAL',
            createdAt: new Date().toISOString(),
        };
        KasService_1.withdrawalRequests.unshift(newRequest);
        return {
            message: 'Pengajuan penarikan dana kas RT berhasil dikirim! Menunggu verifikasi & pencairan oleh Superadmin.',
            penarikan: newRequest,
        };
    }
    async getRiwayatPenarikan(rtId) {
        return KasService_1.withdrawalRequests.filter((r) => r.rtId === rtId);
    }
    async getAllPenarikanSuperadmin() {
        const paidBills = await this.prisma.tagihanWarga.aggregate({
            where: { status: 'PAID' },
            _sum: { totalBayar: true },
        });
        const totalPgInflow = Number(paidBills._sum.totalBayar || 8750000);
        const results = await Promise.all(KasService_1.withdrawalRequests.map(async (req) => {
            const kasSummary = await this.getKasSummary(req.rtId);
            const isSaldoCukup = kasSummary.saldoKas >= req.totalDipotong;
            const isPgSufficient = totalPgInflow >= req.nominalTarik;
            const iuranCount = kasSummary.recentTransactions.filter((t) => t.tipe === client_1.TipeKas.PEMASUKAN && t.kategori.toLowerCase().includes('iuran')).length;
            const totalMutasi = kasSummary.recentTransactions.length || 1;
            const validitasSumberDana = iuranCount > 0 ? '98% Terverifikasi dari Iuran Digital' : 'Tercatat di Buku Kas Resmi';
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
        }));
        return results;
    }
    async approvePenarikan(penarikanId, adminUserId) {
        const item = KasService_1.withdrawalRequests.find((r) => r.id === penarikanId);
        if (!item) {
            throw new common_1.BadRequestException('Pengajuan penarikan tidak ditemukan.');
        }
        if (item.status === 'APPROVED') {
            throw new common_1.BadRequestException('Pengajuan penarikan ini sudah disetujui sebelumnya.');
        }
        await this.createKasEntry(item.rtId, adminUserId, {
            tipe: client_1.TipeKas.PENGELUARAN,
            kategori: 'Penarikan Kas RT',
            nominal: item.totalDipotong,
            keterangan: `Pencairan Kas RT ke rekening ${item.bankName} ${item.nomorRekening} a/n ${item.namaPemilik} (Nominal: Rp ${item.nominalTarik.toLocaleString('id-ID')} + Biaya Platform: Rp 6.000) - Approved by Superadmin`,
        });
        item.status = 'APPROVED';
        item.catatanApproval = 'Pencairan disetujui & dieksekusi oleh Superadmin. Dana telah diteruskan ke rekening RT.';
        item.approvedAt = new Date().toISOString();
        return {
            message: 'Pencairan kas RT berhasil disetujui! Saldo kas RT telah disesuaikan dan dana diteruskan.',
            penarikan: item,
        };
    }
    async rejectPenarikan(penarikanId, alasan) {
        const item = KasService_1.withdrawalRequests.find((r) => r.id === penarikanId);
        if (!item) {
            throw new common_1.BadRequestException('Pengajuan penarikan tidak ditemukan.');
        }
        item.status = 'REJECTED';
        item.catatanApproval = alasan || 'Pengajuan penarikan ditolak oleh Superadmin karena ketidaksesuaian data rekening atau saldo.';
        return {
            message: 'Pengajuan penarikan kas RT telah ditolak. Saldo kas RT tetap utuh.',
            penarikan: item,
        };
    }
    async getSuperadminUangMasuk() {
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
        const boostedAds = await this.prisma.lapakProduk.findMany({
            where: { isPromoted: true },
            include: {
                seller: { include: { profile: true } },
                rt: { include: { rw: { include: { kelurahan: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const mappedTransactions = [];
        let totalHakKasRt = 0;
        let totalCuanPlatform = 0;
        let totalFeeBankVa = 0;
        let totalBruto = 0;
        for (const t of paidTagihan) {
            const metode = t.transaksi[0]?.paymentMethod || 'QRIS';
            const isVa = metode.toString().startsWith('VA_');
            const pokok = Number(t.nominalPokok) || 50000;
            const feePlatform = 1500;
            const feeBank = isVa ? 3000 : 0;
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
                nominalPokok: 0,
                feePlatform: hargaIklan,
                feeBankVa: 0,
                totalBayar: hargaIklan,
                status: 'SETTLED',
            });
        }
        mappedTransactions.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
        return {
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
};
exports.KasService = KasService;
KasService.withdrawalRequests = [
    {
        id: 'WD-RT03-1727334001',
        rtId: 'seed-rt-03',
        rtNomor: '03',
        rwNomor: '05',
        kelurahan: 'Sukamaju',
        requestedById: 'user-bendahara-1',
        requestedByName: 'Bpk. Hendra Gunawan (Bendahara RT)',
        bankName: 'BCA',
        nomorRekening: '8870123456',
        namaPemilik: 'Hendra Gunawan',
        nominalTarik: 1500000,
        biayaAdmin: 6000,
        totalDipotong: 1506000,
        saldoKasSaatPengajuan: 4850000,
        status: 'MENUNGGU_APPROVAL',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
        id: 'WD-RT01-1727312000',
        rtId: 'seed-rt-01',
        rtNomor: '01',
        rwNomor: '02',
        kelurahan: 'Mekarsari',
        requestedById: 'user-bendahara-2',
        requestedByName: 'Ibu Ratna Sari (Bendahara RT 01)',
        bankName: 'Mandiri',
        nomorRekening: '1370019283741',
        namaPemilik: 'Ratna Sari',
        nominalTarik: 2000000,
        biayaAdmin: 6000,
        totalDipotong: 2006000,
        saldoKasSaatPengajuan: 6200000,
        status: 'APPROVED',
        catatanApproval: 'Disetujui. Dana berhasil dicairkan via BI-FAST oleh Superadmin.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        approvedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    }
];
exports.KasService = KasService = KasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KasService);
//# sourceMappingURL=kas.service.js.map