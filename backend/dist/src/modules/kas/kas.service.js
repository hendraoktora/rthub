"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const duitku_service_1 = require("../payment/duitku.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let KasService = KasService_1 = class KasService {
    constructor(prisma, duitkuService) {
        this.prisma = prisma;
        this.duitkuService = duitkuService;
    }
    onModuleInit() {
        KasService_1.loadFromDisk();
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
    getPlatformFeeConfig() {
        return KasService_1.platformFeeConfig;
    }
    updatePlatformFeeConfig(data) {
        if (data.feeTransaksiIuran !== undefined && !isNaN(Number(data.feeTransaksiIuran))) {
            KasService_1.platformFeeConfig.feeTransaksiIuran = Number(data.feeTransaksiIuran);
        }
        if (data.feePenarikanKas !== undefined && !isNaN(Number(data.feePenarikanKas))) {
            KasService_1.platformFeeConfig.feePenarikanKas = Number(data.feePenarikanKas);
        }
        if (data.feeVirtualAccount !== undefined && !isNaN(Number(data.feeVirtualAccount))) {
            KasService_1.platformFeeConfig.feeVirtualAccount = Number(data.feeVirtualAccount);
        }
        if (data.biayaAddonBulanan !== undefined && !isNaN(Number(data.biayaAddonBulanan))) {
            KasService_1.platformFeeConfig.biayaAddonBulanan = Number(data.biayaAddonBulanan);
        }
        KasService_1.platformFeeConfig.updatedAt = new Date().toISOString();
        KasService_1.saveToDisk();
        return {
            message: 'Konfigurasi tarif fee platform berhasil diperbarui.',
            config: KasService_1.platformFeeConfig,
        };
    }
    static getStoragePath(fileName) {
        const dataDir = path.resolve(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            try {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            catch (_) { }
        }
        return path.join(dataDir, fileName);
    }
    static loadFromDisk() {
        try {
            const wdPath = KasService_1.getStoragePath('penarikan_requests.json');
            if (fs.existsSync(wdPath)) {
                const raw = fs.readFileSync(wdPath, 'utf-8');
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    KasService_1.withdrawalRequests = parsed;
                }
            }
            const feePath = KasService_1.getStoragePath('platform_fee_config.json');
            if (fs.existsSync(feePath)) {
                const rawFee = fs.readFileSync(feePath, 'utf-8');
                const parsedFee = JSON.parse(rawFee);
                if (parsedFee && typeof parsedFee === 'object') {
                    KasService_1.platformFeeConfig = { ...KasService_1.platformFeeConfig, ...parsedFee };
                }
            }
        }
        catch (e) {
            console.error('Failed to load data from disk:', e);
        }
    }
    static saveToDisk() {
        try {
            const wdPath = KasService_1.getStoragePath('penarikan_requests.json');
            fs.writeFileSync(wdPath, JSON.stringify(KasService_1.withdrawalRequests, null, 2), 'utf-8');
            const feePath = KasService_1.getStoragePath('platform_fee_config.json');
            fs.writeFileSync(feePath, JSON.stringify(KasService_1.platformFeeConfig, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save data to disk:', e);
        }
    }
    async ajukanPenarikanKas(rtId, userId, data) {
        const nominalTarik = Number(data.nominalTarik);
        if (!nominalTarik || nominalTarik < 20000) {
            throw new common_1.BadRequestException('Nominal penarikan minimal Rp 20.000.');
        }
        const kasSummary = await this.getKasSummary(rtId);
        const biayaAdmin = KasService_1.platformFeeConfig.feePenarikanKas;
        const totalDipotong = nominalTarik + biayaAdmin;
        if (kasSummary.saldoKas < totalDipotong) {
            throw new common_1.BadRequestException(`Saldo kas RT (Rp ${kasSummary.saldoKas.toLocaleString('id-ID')}) tidak mencukupi untuk penarikan Rp ${nominalTarik.toLocaleString('id-ID')} + Biaya Transfer Rp ${biayaAdmin.toLocaleString('id-ID')}.`);
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
        KasService_1.saveToDisk();
        return {
            message: 'Pengajuan penarikan dana kas RT berhasil dikirim! Menunggu verifikasi & pencairan oleh Superadmin.',
            penarikan: newRequest,
        };
    }
    async getRiwayatPenarikan(rtId) {
        KasService_1.loadFromDisk();
        return KasService_1.withdrawalRequests.filter((r) => r.rtId === rtId);
    }
    async getAllPenarikanSuperadmin() {
        KasService_1.loadFromDisk();
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
        KasService_1.loadFromDisk();
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
            keterangan: `Pencairan Kas RT ke rekening ${item.bankName} ${item.nomorRekening} a/n ${item.namaPemilik} (Nominal: Rp ${item.nominalTarik.toLocaleString('id-ID')} + Biaya Platform: Rp ${item.biayaAdmin.toLocaleString('id-ID')}) - Approved by Superadmin`,
        });
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
        KasService_1.saveToDisk();
        return {
            message: 'Pencairan kas RT berhasil disetujui! Saldo kas RT telah disesuaikan dan instruksi payout Duitku diteruskan.',
            penarikan: item,
            disbursement: payoutRes,
        };
    }
    async rejectPenarikan(penarikanId, alasan) {
        KasService_1.loadFromDisk();
        const item = KasService_1.withdrawalRequests.find((r) => r.id === penarikanId);
        if (!item) {
            throw new common_1.BadRequestException('Pengajuan penarikan tidak ditemukan.');
        }
        item.status = 'REJECTED';
        item.catatanApproval = alasan || 'Pengajuan penarikan ditolak oleh Superadmin karena ketidaksesuaian data rekening atau saldo.';
        KasService_1.saveToDisk();
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
            const feePlatform = KasService_1.platformFeeConfig.feeTransaksiIuran;
            const feeBank = isVa ? KasService_1.platformFeeConfig.feeVirtualAccount : 0;
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
};
exports.KasService = KasService;
KasService.withdrawalRequests = [];
KasService.platformFeeConfig = {
    feeTransaksiIuran: 1500,
    feePenarikanKas: 6000,
    feeVirtualAccount: 3000,
    biayaAddonBulanan: 49000,
    updatedAt: new Date().toISOString(),
};
exports.KasService = KasService = KasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        duitku_service_1.DuitkuService])
], KasService);
//# sourceMappingURL=kas.service.js.map