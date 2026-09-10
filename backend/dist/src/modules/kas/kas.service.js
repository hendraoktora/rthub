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
exports.KasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let KasService = class KasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKasSummary(rtId) {
        let targetRtId = rtId;
        if (!targetRtId) {
            const defaultRt = await this.prisma.rT.findFirst();
            targetRtId = defaultRt?.id;
        }
        const whereClause = targetRtId ? { rtId: targetRtId } : {};
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
        let targetRtId = rtId;
        if (!targetRtId) {
            const defaultRt = await this.prisma.rT.findFirst();
            targetRtId = defaultRt?.id;
        }
        if (!targetRtId) {
            throw new common_1.BadRequestException('Wilayah RT tidak ditemukan.');
        }
        const currentSummary = await this.getKasSummary(targetRtId);
        const newSaldo = data.tipe === client_1.TipeKas.PEMASUKAN
            ? currentSummary.saldoKas + nominalNum
            : currentSummary.saldoKas - nominalNum;
        return this.prisma.kasRT.create({
            data: {
                rtId: targetRtId,
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
};
exports.KasService = KasService;
exports.KasService = KasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KasService);
//# sourceMappingURL=kas.service.js.map