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
            adminFee: process.env.DEFAULT_ADMIN_FEE || 1500,
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
    async getInstruksiBayar(tagihanId) {
        const tagihan = await this.prisma.tagihanWarga.findUnique({
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
            throw new common_1.NotFoundException('Tagihan tidak ditemukan.');
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
    async konfirmasiBayarWarga(tagihanId, userId, data) {
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
                adminFee: 0,
                totalBayar: tagihan.nominalPokok,
                paymentMethod: data.paymentMethod || client_1.PaymentMethod.QRIS,
                status: client_1.PaymentStatus.PENDING,
                buktiBayarUrl: data.buktiBayarUrl || null,
                referenceId: `TF-${Date.now()}`,
            },
        });
        await this.prisma.tagihanWarga.update({
            where: { id: tagihan.id },
            data: { status: client_1.StatusTagihan.PENDING },
        });
        return {
            message: 'Konfirmasi pembayaran berhasil dikirim. Menunggu verifikasi bendahara RT.',
            transaksiId: transaksi.id,
            status: 'PENDING',
        };
    }
    async terimaTunai(tagihanId, bendaharaUserId) {
        const tagihan = await this.prisma.tagihanWarga.findUnique({
            where: { id: tagihanId },
            include: { masterTagihan: true, rumah: true },
        });
        if (!tagihan) {
            throw new common_1.NotFoundException('Tagihan tidak ditemukan.');
        }
        if (tagihan.status === client_1.StatusTagihan.PAID) {
            throw new common_1.BadRequestException('Tagihan sudah lunas.');
        }
        const transaksi = await this.prisma.transaksiPembayaran.create({
            data: {
                tagihanId: tagihan.id,
                userId: bendaharaUserId,
                nominalPokok: tagihan.nominalPokok,
                adminFee: 0,
                totalBayar: tagihan.nominalPokok,
                paymentMethod: client_1.PaymentMethod.CASH,
                status: client_1.PaymentStatus.SUCCESS,
                paidAt: new Date(),
            },
        });
        await this.prisma.tagihanWarga.update({
            where: { id: tagihan.id },
            data: { status: client_1.StatusTagihan.PAID, paidAt: new Date() },
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
                createdById: bendaharaUserId,
                tipe: client_1.TipeKas.PEMASUKAN,
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
    async approveTransaksi(transaksiId, bendaharaUserId) {
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
            throw new common_1.NotFoundException('Transaksi tidak ditemukan.');
        }
        if (transaksi.status === client_1.PaymentStatus.SUCCESS) {
            throw new common_1.BadRequestException('Transaksi ini sudah disetujui sebelumnya.');
        }
        await this.prisma.transaksiPembayaran.update({
            where: { id: transaksi.id },
            data: {
                status: client_1.PaymentStatus.SUCCESS,
                paidAt: new Date(),
            },
        });
        await this.prisma.tagihanWarga.update({
            where: { id: transaksi.tagihanId },
            data: {
                status: client_1.StatusTagihan.PAID,
                paidAt: new Date(),
            },
        });
        const currentKas = await this.prisma.kasRT.findFirst({
            where: { rtId: transaksi.tagihan.rumah.rtId },
            orderBy: { createdAt: 'desc' },
        });
        const currentSaldo = currentKas ? Number(currentKas.saldoBerjalan) : 0;
        const newSaldo = currentSaldo + Number(transaksi.nominalPokok);
        const caraBayar = transaksi.paymentMethod === client_1.PaymentMethod.QRIS ? 'QRIS RT' : 'Transfer Bank';
        await this.prisma.kasRT.create({
            data: {
                rtId: transaksi.tagihan.rumah.rtId,
                createdById: bendaharaUserId,
                tipe: client_1.TipeKas.PEMASUKAN,
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
    async getPendingVerifikasi(rtId) {
        return this.prisma.transaksiPembayaran.findMany({
            where: {
                status: client_1.PaymentStatus.PENDING,
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
        const isCash = paymentMethod === client_1.PaymentMethod.CASH;
        const transaksi = await this.prisma.transaksiPembayaran.create({
            data: {
                tagihanId: tagihan.id,
                userId,
                nominalPokok: tagihan.nominalPokok,
                adminFee: 0,
                totalBayar: tagihan.nominalPokok,
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
                tipe: client_1.TipeKas.PEMASUKAN,
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
};
exports.TagihanService = TagihanService;
exports.TagihanService = TagihanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TagihanService);
//# sourceMappingURL=tagihan.service.js.map