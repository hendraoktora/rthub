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
        try {
            let rwId = user?.rwId || user?.rt?.rwId;
            let kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
            let rtId = user?.rtId;
            if (user?.id) {
                const dbUser = await this.prisma.user.findUnique({
                    where: { id: user.id },
                    include: { rt: { include: { rw: true } } },
                });
                if (dbUser) {
                    rwId = dbUser.rwId || dbUser.rt?.rwId || rwId;
                    kelurahanId = dbUser.kelurahanId || dbUser.rt?.rw?.kelurahanId || kelurahanId;
                    rtId = dbUser.rtId || rtId;
                }
            }
            const orConditions = [];
            if (user?.id) {
                orConditions.push({ sellerId: user.id });
            }
            orConditions.push({
                isPromoted: true,
                paketIklan: { in: ['SEMUA', 'GLOBAL', 'NASIONAL', 'IKLAN_GLOBAL'] },
            });
            if (kelurahanId) {
                orConditions.push({
                    isPromoted: true,
                    paketIklan: { in: ['KELURAHAN', 'LURAH', 'IKLAN_KELURAHAN'] },
                    kelurahanId: kelurahanId,
                });
            }
            if (rwId && kelurahanId) {
                orConditions.push({
                    isPromoted: true,
                    paketIklan: { in: ['RW', 'IKLAN_RW'] },
                    rwId: rwId,
                    kelurahanId: kelurahanId,
                });
            }
            else if (rwId) {
                orConditions.push({
                    isPromoted: true,
                    paketIklan: { in: ['RW', 'IKLAN_RW'] },
                    rwId: rwId,
                });
            }
            if (rtId && rwId && kelurahanId) {
                orConditions.push({
                    isPromoted: true,
                    paketIklan: { in: ['RT', 'IKLAN_RT'] },
                    rtId: rtId,
                    rwId: rwId,
                    kelurahanId: kelurahanId,
                });
            }
            else if (rtId) {
                orConditions.push({
                    isPromoted: true,
                    paketIklan: { in: ['RT', 'IKLAN_RT'] },
                    rtId: rtId,
                });
            }
            if (rtId) {
                orConditions.push({
                    isPromoted: false,
                    rtId: rtId,
                });
            }
            if (rwId && kelurahanId) {
                orConditions.push({
                    isPromoted: false,
                    rwId: rwId,
                    kelurahanId: kelurahanId,
                });
            }
            try {
                this.prisma.$executeRawUnsafe(`UPDATE LapakProduk SET isPromoted = 0, promotedBadge = NULL WHERE isPromoted = 1 AND promotedUntil IS NOT NULL AND promotedUntil <= NOW()`).catch(() => { });
                const now = new Date();
                const sanitizePromotion = (r) => {
                    const expired = r.promotedUntil ? new Date(r.promotedUntil) <= now : false;
                    const isPromoted = Boolean((r.isPromoted === true || r.isPromoted === 1 || r.isPromoted === '1') && !expired);
                    let sisaDurasiHari = null;
                    let sisaDurasiJam = null;
                    if (isPromoted && r.promotedUntil) {
                        const diffMs = Math.max(0, new Date(r.promotedUntil).getTime() - now.getTime());
                        sisaDurasiHari = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                        sisaDurasiJam = Math.ceil(diffMs / (1000 * 60 * 60));
                    }
                    return {
                        ...r,
                        isPromoted,
                        promotedBadge: isPromoted ? (r.promotedBadge || 'SPONSORED') : null,
                        paketIklan: isPromoted ? r.paketIklan : null,
                        promotedAt: isPromoted ? r.promotedAt : null,
                        promotedUntil: isPromoted ? r.promotedUntil : null,
                        sisaDurasiHari,
                        sisaDurasiJam,
                    };
                };
                const items = await this.prisma.lapakProduk.findMany({
                    where: {
                        OR: orConditions,
                        isActive: true,
                    },
                    include: {
                        seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
                        rt: { select: { id: true, nomor: true, rwId: true, rw: { select: { id: true, nomor: true, kelurahanId: true } } } },
                    },
                    orderBy: [
                        { isPromoted: 'desc' },
                        { createdAt: 'desc' },
                    ],
                    take: 50,
                });
                return items.map(sanitizePromotion);
            }
            catch (innerErr) {
                return [];
            }
        }
        catch (outerErr) {
            console.error('getFeedLapak error:', outerErr);
            return [];
        }
    }
    async getFeedKontrakan(user) {
        const rwId = user?.rwId || user?.rt?.rwId;
        const kelurahanId = user?.kelurahanId || user?.rt?.rw?.kelurahanId;
        const rtId = user?.rtId;
        const filters = [];
        if (rtId)
            filters.push({ rtId });
        if (rwId)
            filters.push({ rwId });
        if (kelurahanId)
            filters.push({ kelurahanId });
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
        if (!user || !user.id) {
            throw new common_1.BadRequestException('Autentikasi akun diperlukan untuk membuat produk.');
        }
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        let rtId = dbUser?.rtId || user?.rtId;
        let rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        let kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        if (!rwId && rtId) {
            const rt = await this.prisma.rT.findUnique({ where: { id: rtId }, include: { rw: true } });
            if (rt) {
                rwId = rt.rwId;
                kelurahanId = kelurahanId || rt.rw?.kelurahanId;
            }
        }
        if (!kelurahanId && rwId) {
            const rw = await this.prisma.rW.findUnique({ where: { id: rwId } });
            if (rw) {
                kelurahanId = rw.kelurahanId;
            }
        }
        if (!rtId || !rwId || !kelurahanId) {
            throw new common_1.BadRequestException('Data wilayah (RT/RW/Kelurahan) Anda belum lengkap.');
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
                isPromoted: false,
                promotedBadge: null,
                paketIklan: null,
                promotedUntil: null,
            },
        });
    }
    async boostProduk(id, user, data) {
        const scope = (data.scope || 'RT').toUpperCase();
        const duration = Number(data.durationDays) || 7;
        const now = new Date();
        const existing = await this.prisma.lapakProduk.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Produk tidak ditemukan.');
        }
        let baseTime = now.getTime();
        let initialPromotedAt = existing.promotedAt || now;
        if (existing.isPromoted && existing.promotedUntil && new Date(existing.promotedUntil) > now) {
            baseTime = new Date(existing.promotedUntil).getTime();
        }
        else {
            initialPromotedAt = now;
        }
        const expiry = data.promotedUntil
            ? new Date(data.promotedUntil)
            : new Date(baseTime + duration * 24 * 60 * 60 * 1000);
        const diffMs = Math.max(0, expiry.getTime() - now.getTime());
        const sisaDurasiHari = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const sisaDurasiJam = Math.ceil(diffMs / (1000 * 60 * 60));
        try {
            const updated = await this.prisma.lapakProduk.update({
                where: { id },
                data: {
                    isPromoted: true,
                    promotedBadge: 'SPONSORED',
                    paketIklan: scope,
                    promotedAt: initialPromotedAt,
                    promotedUntil: expiry,
                },
                include: {
                    seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
                    rt: { select: { nomor: true } },
                },
            });
            return {
                ...updated,
                sisaDurasiHari,
                sisaDurasiJam,
            };
        }
        catch (err) {
            const formattedExpiry = expiry.toISOString().slice(0, 19).replace('T', ' ');
            const formattedPromotedAt = initialPromotedAt.toISOString().slice(0, 19).replace('T', ' ');
            await this.prisma.$executeRawUnsafe(`UPDATE LapakProduk SET isPromoted = 1, promotedBadge = 'SPONSORED', paketIklan = ?, promotedAt = ?, promotedUntil = ? WHERE id = ?`, scope, formattedPromotedAt, formattedExpiry, id);
            const res = await this.prisma.lapakProduk.findUnique({
                where: { id },
                include: {
                    seller: { select: { id: true, phone: true, profile: { select: { namaLengkap: true, noRumah: true } } } },
                    rt: { select: { nomor: true } },
                },
            });
            return {
                ...res,
                isPromoted: true,
                promotedBadge: 'SPONSORED',
                paketIklan: scope,
                promotedAt: initialPromotedAt,
                promotedUntil: expiry,
                sisaDurasiHari,
                sisaDurasiJam,
            };
        }
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