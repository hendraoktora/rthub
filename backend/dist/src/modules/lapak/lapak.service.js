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
        const rwId = user?.rwId || user?.rt?.rwId;
        const kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
        const rtId = user?.rtId;
        const filters = [];
        if (rwId)
            filters.push({ rwId });
        if (kelurahanId)
            filters.push({ kelurahanId });
        if (rtId)
            filters.push({ rtId });
        if (filters.length === 0) {
            return [];
        }
        return this.prisma.lapakProduk.findMany({
            where: {
                OR: filters,
                isActive: true,
            },
            include: {
                seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
                rt: { select: { nomor: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async getFeedKontrakan(user) {
        const rwId = user?.rwId || user?.rt?.rwId;
        const kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
        const rtId = user?.rtId;
        const filters = [];
        if (rwId)
            filters.push({ rwId });
        if (kelurahanId)
            filters.push({ kelurahanId });
        if (rtId)
            filters.push({ rtId });
        if (filters.length === 0) {
            return [];
        }
        return this.prisma.infoKontrakan.findMany({
            where: {
                OR: filters,
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
        let rwId = user?.rwId || user?.rt?.rwId;
        let kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
        if ((!rwId || !kelurahanId) && rtId) {
            const rt = await this.prisma.rT.findUnique({ where: { id: rtId }, include: { rw: true } });
            if (rt) {
                rwId = rwId || rt.rwId;
                kelurahanId = kelurahanId || rt.rw?.kelurahanId;
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