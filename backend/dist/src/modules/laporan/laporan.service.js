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
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        const rtId = dbUser?.rtId || user?.rtId;
        const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        if (!rtId) {
            throw new common_1.BadRequestException('Akun Anda belum terdaftar dalam unit RT manapun.');
        }
        const dataSuratString = data.dataSurat
            ? typeof data.dataSurat === 'object'
                ? JSON.stringify(data.dataSurat)
                : String(data.dataSurat)
            : null;
        return this.prisma.laporanWarga.create({
            data: {
                userId: user.id,
                rtId: rtId,
                rwId: rwId || null,
                kelurahanId: kelurahanId || null,
                judul: data.judul,
                deskripsi: data.deskripsi || '',
                kategori: data.kategori || 'FASILITAS_UMUM',
                fotoUrl: data.fotoUrl || null,
                isAnonymous: Boolean(data.isAnonymous),
                status: client_1.StatusLaporan.PENDING,
                tujuan: data.tujuan || 'KETUA_RT',
                tipeLaporan: data.tipeLaporan || 'PENGADUAN',
                dataSurat: dataSuratString,
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
                                nik: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getLaporanList(user) {
        if (user?.role === client_1.Role.SUPERADMIN) {
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
                                    nik: true,
                                },
                            },
                        },
                    },
                    rt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 100,
            });
        }
        if (!user?.rtId) {
            return [];
        }
        if (user.role === client_1.Role.WARGA) {
            return this.prisma.laporanWarga.findMany({
                where: {
                    rtId: user.rtId,
                    userId: user.id,
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
                                    nik: true,
                                },
                            },
                        },
                    },
                    rt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        }
        if (user.role === client_1.Role.SECURITY) {
            return this.prisma.laporanWarga.findMany({
                where: {
                    rtId: user.rtId,
                    OR: [
                        { tujuan: 'KEAMANAN' },
                        { tujuan: 'UMUM' },
                        { userId: user.id },
                    ],
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
                                    nik: true,
                                },
                            },
                        },
                    },
                    rt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        }
        if (user.role === client_1.Role.BENDAHARA_RT) {
            return this.prisma.laporanWarga.findMany({
                where: {
                    rtId: user.rtId,
                    OR: [
                        { tujuan: 'BENDAHARA_RT' },
                        { tujuan: 'UMUM' },
                        { userId: user.id },
                    ],
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
                                    nik: true,
                                },
                            },
                        },
                    },
                    rt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        }
        if (user.role === client_1.Role.SEKRETARIS_RT) {
            return this.prisma.laporanWarga.findMany({
                where: {
                    rtId: user.rtId,
                    OR: [
                        { tujuan: 'SEKRETARIS_RT' },
                        { tujuan: 'UMUM' },
                        { tipeLaporan: { not: 'PENGADUAN' } },
                        { userId: user.id },
                    ],
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
                                    nik: true,
                                },
                            },
                        },
                    },
                    rt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        }
        return this.prisma.laporanWarga.findMany({
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
                                nik: true,
                            },
                        },
                    },
                },
                rt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async updateStatus(user, laporanId, data) {
        const laporan = await this.prisma.laporanWarga.findUnique({
            where: { id: laporanId },
            include: { rt: true },
        });
        if (!laporan) {
            throw new common_1.NotFoundException('Laporan atau permohonan surat tidak ditemukan.');
        }
        let mappedStatus;
        const rawStatus = String(data.status || '').toUpperCase();
        if (rawStatus === 'SELESAI' || rawStatus === 'RESOLVED' || rawStatus === 'SELESAIKAN') {
            mappedStatus = client_1.StatusLaporan.RESOLVED;
        }
        else if (rawStatus === 'DIPROSES' || rawStatus === 'IN_PROGRESS' || rawStatus === 'PROSES') {
            mappedStatus = client_1.StatusLaporan.IN_PROGRESS;
        }
        else if (rawStatus === 'DITOLAK' || rawStatus === 'REJECTED' || rawStatus === 'TOLAK') {
            mappedStatus = client_1.StatusLaporan.REJECTED;
        }
        else if (rawStatus === 'PENDING' || rawStatus === 'MENUNGGU') {
            mappedStatus = client_1.StatusLaporan.PENDING;
        }
        else {
            mappedStatus = rawStatus || client_1.StatusLaporan.RESOLVED;
        }
        const userRole = user?.role;
        const isSuperAdmin = userRole === client_1.Role.SUPERADMIN;
        const isKetuaRT = userRole === client_1.Role.ADMIN_RT && laporan.rtId === user.rtId;
        const isSekretaris = userRole === client_1.Role.SEKRETARIS_RT && (laporan.tujuan === 'SEKRETARIS_RT' || laporan.tujuan === 'UMUM' || laporan.tipeLaporan !== 'PENGADUAN');
        const isBendahara = userRole === client_1.Role.BENDAHARA_RT && (laporan.tujuan === 'BENDAHARA_RT' || laporan.tujuan === 'UMUM');
        const isSecurity = userRole === client_1.Role.SECURITY && (laporan.tujuan === 'KEAMANAN' || laporan.tujuan === 'UMUM');
        if (!isSuperAdmin && !isKetuaRT && !isSekretaris && !isBendahara && !isSecurity) {
            throw new common_1.ForbiddenException('Hanya pihak yang ditunjuk atau Ketua RT yang memiliki wewenang untuk memberikan tanggapan atau menyelesaikan laporan ini.');
        }
        let nomorSurat = data.nomorSurat || laporan.nomorSurat;
        if (mappedStatus === client_1.StatusLaporan.RESOLVED && !nomorSurat && laporan.tipeLaporan !== 'PENGADUAN') {
            const currentYear = new Date().getFullYear();
            const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
            const romanMonth = romanMonths[new Date().getMonth()];
            const randomSeq = String(Math.floor(100 + Math.random() * 900));
            nomorSurat = `470/${randomSeq}/RT.${laporan.rt?.nomor || '03'}-RW.05/${romanMonth}/${currentYear}`;
        }
        const responderName = data.tanggapanBy ||
            (user?.profile?.namaLengkap ? `${user.profile.namaLengkap} (${user.role})` : user?.phone || 'Pengurus RT');
        return this.prisma.laporanWarga.update({
            where: { id: laporanId },
            data: {
                status: mappedStatus,
                tanggapanRT: data.tanggapanRT || null,
                tanggapanBy: responderName,
                nomorSurat: nomorSurat || null,
                respondedAt: new Date(),
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
                                nik: true,
                            },
                        },
                    },
                },
                rt: true,
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