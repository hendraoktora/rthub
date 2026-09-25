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
exports.CctvService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CctvService = class CctvService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCctvList(user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        const rtId = dbUser?.rtId || user?.rtId;
        const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        const orConditions = [];
        if (rtId) {
            orConditions.push({ rtId: rtId, isActive: true });
        }
        if (rwId && kelurahanId) {
            orConditions.push({ rtId: null, rwId: rwId, kelurahanId: kelurahanId, isActive: true });
        }
        if (orConditions.length === 0) {
            return [];
        }
        return this.prisma.cCTV.findMany({
            where: { OR: orConditions },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createCctv(user, data) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        const rtId = dbUser?.rtId || user?.rtId;
        const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        return this.prisma.cCTV.create({
            data: {
                rtId: rtId || null,
                rwId: rwId || null,
                kelurahanId: kelurahanId || null,
                namaTitik: data.namaTitik,
                streamUrl: data.streamUrl,
                thumbnailUrl: data.thumbnailUrl || null,
                isActive: true,
            },
        });
    }
    async deleteCctv(id, user) {
        return this.prisma.cCTV.deleteMany({
            where: {
                id,
                OR: [
                    { rtId: user.rtId },
                    { rwId: user.rwId },
                ],
            },
        });
    }
};
exports.CctvService = CctvService;
exports.CctvService = CctvService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CctvService);
//# sourceMappingURL=cctv.service.js.map