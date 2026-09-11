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
exports.LapakService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LapakService = class LapakService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFeedLapak(user) {
        const filters = [];
        if (user?.rwId)
            filters.push({ rwId: user.rwId });
        if (user?.kelurahanId)
            filters.push({ kelurahanId: user.kelurahanId });
        if (user?.rtId)
            filters.push({ rtId: user.rtId });
        let products = await this.prisma.lapakProduk.findMany({
            where: {
                ...(filters.length > 0 ? { OR: filters } : {}),
                isActive: true,
            },
            include: {
                seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
                rt: { select: { nomor: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        if (products.length === 0) {
            products = await this.prisma.lapakProduk.findMany({
                where: { isActive: true },
                include: {
                    seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
                    rt: { select: { nomor: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        }
        return products;
    }
    async getFeedKontrakan(user) {
        const filters = [];
        if (user?.rwId)
            filters.push({ rwId: user.rwId });
        if (user?.kelurahanId)
            filters.push({ kelurahanId: user.kelurahanId });
        if (user?.rtId)
            filters.push({ rtId: user.rtId });
        return this.prisma.infoKontrakan.findMany({
            where: {
                ...(filters.length > 0 ? { OR: filters } : {}),
                status: 'TERSEDIA',
            },
            include: {
                rt: { select: { nomor: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createProduk(user, data) {
        let rtId = user?.rtId;
        let rwId = user?.rwId;
        let kelurahanId = user?.kelurahanId;
        if (!rtId || !rwId || !kelurahanId) {
            const defaultRt = await this.prisma.rT.findFirst();
            if (defaultRt) {
                rtId = rtId || defaultRt.id;
                rwId = rwId || defaultRt.rwId;
                const rw = await this.prisma.rW.findUnique({ where: { id: defaultRt.rwId } });
                kelurahanId = kelurahanId || rw?.kelurahanId || null;
            }
        }
        return this.prisma.lapakProduk.create({
            data: {
                sellerId: user.id,
                rtId: rtId,
                rwId: rwId,
                kelurahanId: kelurahanId,
                judul: data.judul,
                deskripsi: data.deskripsi || '',
                harga: Number(data.harga) || 0,
                kategori: data.kategori || 'PRODUK',
                kontakWa: data.kontakWa || user.phone,
                fotoUrl: data.fotoUrl || null,
            },
        });
    }
    async deleteProduk(id, user) {
        return this.prisma.lapakProduk.delete({
            where: { id },
        });
    }
};
exports.LapakService = LapakService;
exports.LapakService = LapakService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LapakService);
//# sourceMappingURL=lapak.service.js.map