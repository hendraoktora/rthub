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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagihanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TagihanService = class TagihanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMasterTagihan(rtId) {
        return this.prisma.masterTagihan.findMany({
            where: { rtId, isActive: true },
        });
    }
    async setMasterTagihan(rtId, data) {
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
    async generateTagihanBulanan(rtId, masterTagihanId, bulan, tahun) {
        const master = await this.prisma.masterTagihan.findUnique({
            where: { id: masterTagihanId },
        });
        if (!master || master.rtId !== rtId) {
            throw new common_1.NotFoundException('Master tagihan tidak ditemukan.');
        }
        const rumahList = await this.prisma.rumah.findMany({
            where: { rtId },
        });
        const jatuhTempo = new Date(tahun, bulan - 1, 10);
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
                        status: client_1.StatusTagihan.UNPAID,
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
    async getTagihanSaya(user) {
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
    async bayarTagihan(tagihanId, userId, paymentMethod) {
        const tagihan = await this.prisma.tagihanWarga.findUnique({
            where: { id: tagihanId },
            include: { masterTagihan: true, rumah: true },
        });
        if (!tagihan) {
            throw new common_1.NotFoundException('Tagihan tidak ditemukan.');
        }
        if (tagihan.status === client_1.StatusTagihan.PAID) {
            throw new common_1.BadRequestException('Tagihan ini sudah lunas.');
        }
        const transaksi = await this.prisma.transaksiPembayaran.create({
            data: {
                tagihanId: tagihan.id,
                userId,
                nominalPokok: tagihan.nominalPokok,
                adminFee: tagihan.adminFee,
                totalBayar: tagihan.totalBayar,
                paymentMethod,
                status: client_1.PaymentStatus.SUCCESS,
                paidAt: new Date(),
            },
        });
        await this.prisma.tagihanWarga.update({
            where: { id: tagihan.id },
            data: {
                status: client_1.StatusTagihan.PAID,
                paidAt: new Date(),
            },
        });
        await this.prisma.systemFeeLog.create({
            data: {
                transaksiId: transaksi.id,
                rtId: tagihan.rumah.rtId,
                nominalFee: tagihan.adminFee,
                isSettled: false,
            },
        });
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
                tipe: client_1.TipeKas.PEMASUKAN,
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
};
exports.TagihanService = TagihanService;
exports.TagihanService = TagihanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TagihanService);
//# sourceMappingURL=tagihan.service.js.map