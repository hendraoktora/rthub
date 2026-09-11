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
exports.LaporanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let LaporanService = class LaporanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLaporan(user, data) {
        let rtId = user?.rtId;
        if (!rtId) {
            const defaultRt = await this.prisma.rT.findFirst();
            rtId = defaultRt?.id;
        }
        if (!rtId) {
            throw new common_1.BadRequestException('Unit RT tidak ditemukan.');
        }
        return this.prisma.laporanWarga.create({
            data: {
                userId: user.id,
                rtId: rtId,
                judul: data.judul,
                deskripsi: data.deskripsi || '',
                kategori: data.kategori || 'FASILITAS_UMUM',
                fotoUrl: data.fotoUrl || null,
                isAnonymous: Boolean(data.isAnonymous),
                status: client_1.StatusLaporan.PENDING,
            },
            include: {
                user: {
                    select: {
                        profile: {
                            select: {
                                namaLengkap: true,
                                noRumah: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getLaporanList(user) {
        if (user?.role === client_1.Role.SUPERADMIN || !user?.rtId) {
            return this.prisma.laporanWarga.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            profile: {
                                select: {
                                    namaLengkap: true,
                                    noRumah: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        }
        const list = await this.prisma.laporanWarga.findMany({
            where: {
                rtId: user.rtId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        phone: true,
                        profile: {
                            select: {
                                namaLengkap: true,
                                noRumah: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        if (list.length === 0) {
            return this.prisma.laporanWarga.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            phone: true,
                            profile: {
                                select: {
                                    namaLengkap: true,
                                    noRumah: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        }
        return list;
    }
    async updateStatus(laporanId, data) {
        return this.prisma.laporanWarga.update({
            where: { id: laporanId },
            data: {
                status: data.status,
                tanggapanRT: data.tanggapanRT,
            },
        });
    }
};
exports.LaporanService = LaporanService;
exports.LaporanService = LaporanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LaporanService);
//# sourceMappingURL=laporan.service.js.map