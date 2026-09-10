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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WilayahService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
let WilayahService = class WilayahService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKelurahanList() {
        return this.prisma.kelurahan.findMany({
            include: {
                _count: { select: { rws: true } },
            },
            orderBy: { nama: 'asc' },
        });
    }
    async getRwByKelurahan(kelurahanId) {
        return this.prisma.rW.findMany({
            where: { kelurahanId },
            include: {
                _count: { select: { rts: true } },
            },
            orderBy: { nomor: 'asc' },
        });
    }
    async getRtByRw(rwId) {
        return this.prisma.rT.findMany({
            where: { rwId },
            include: {
                _count: { select: { users: true, rumah: true } },
            },
            orderBy: { nomor: 'asc' },
        });
    }
    async getAllRtSummary() {
        const rts = await this.prisma.rT.findMany({
            include: {
                rw: {
                    include: {
                        kelurahan: true,
                    },
                },
                users: {
                    where: { role: client_1.Role.ADMIN_RT },
                    include: { profile: true },
                },
                _count: {
                    select: {
                        users: true,
                        rumah: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const results = await Promise.all(rts.map(async (rt) => {
            const totalIn = await this.prisma.kasRT.aggregate({
                where: { rtId: rt.id, tipe: client_1.TipeKas.PEMASUKAN },
                _sum: { nominal: true },
            });
            const totalOut = await this.prisma.kasRT.aggregate({
                where: { rtId: rt.id, tipe: client_1.TipeKas.PENGELUARAN },
                _sum: { nominal: true },
            });
            const sumIn = Number(totalIn._sum.nominal || 0);
            const sumOut = Number(totalOut._sum.nominal || 0);
            const saldoKas = sumIn - sumOut;
            const ketua = rt.users[0]?.profile?.namaLengkap || 'Ketua RT Aktif';
            const phone = rt.users[0]?.phone || '-';
            return {
                id: rt.id,
                nomor: rt.nomor,
                namaJalan: rt.namaJalan || `RT ${rt.nomor}`,
                rwNomor: rt.rw.nomor,
                kelurahanNama: rt.rw.kelurahan.nama,
                kota: rt.rw.kelurahan.kota || 'Depok',
                label: `RT ${rt.nomor} / RW ${rt.rw.nomor} (${rt.rw.kelurahan.nama})`,
                wargaCount: rt._count.users > 0 ? rt._count.users : (rt._count.rumah || 1),
                rumahCount: rt._count.rumah,
                ketua,
                phone,
                saldoKas,
                createdAt: rt.createdAt,
            };
        }));
        return results;
    }
    async getWargaByRt(rtId) {
        const rumahList = await this.prisma.rumah.findMany({
            where: { rtId },
            include: {
                kartuKeluarga: {
                    include: {
                        anggota: true,
                    },
                },
                tagihanWarga: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { noRumah: 'asc' },
        });
        const users = await this.prisma.user.findMany({
            where: { rtId },
            include: {
                profile: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        return {
            totalRumah: rumahList.length,
            totalWarga: users.length,
            rumahList,
            userList: users.map(u => {
                const { passwordHash, ...rest } = u;
                return rest;
            }),
        };
    }
    async addWargaToRt(rtId, data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { phone: data.phone.trim() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Nomor WhatsApp warga sudah terdaftar di sistem.');
        }
        const rt = await this.prisma.rT.findUnique({
            where: { id: rtId },
            include: { rw: true },
        });
        if (!rt) {
            throw new common_1.BadRequestException('Data RT tidak ditemukan.');
        }
        let rumah = await this.prisma.rumah.findFirst({
            where: {
                rtId,
                noRumah: data.noRumah.trim(),
            },
        });
        if (!rumah) {
            rumah = await this.prisma.rumah.create({
                data: {
                    rtId,
                    noRumah: data.noRumah.trim(),
                    alamatLengkap: `${data.noRumah.trim()}, RT ${rt.nomor}/RW ${rt.rw.nomor}`,
                    statusHunian: data.statusHunian || 'TETAP',
                },
            });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Password123!', salt);
        const user = await this.prisma.user.create({
            data: {
                phone: data.phone.trim(),
                passwordHash,
                role: client_1.Role.WARGA,
                rtId: rt.id,
                rwId: rt.rwId,
                kelurahanId: rt.rw.kelurahanId,
                profile: {
                    create: {
                        namaLengkap: data.namaLengkap.trim(),
                        noRumah: data.noRumah.trim(),
                        nik: data.nik?.trim() || null,
                        noKk: data.noKk?.trim() || null,
                    },
                },
            },
            include: {
                profile: true,
            },
        });
        if (data.noKk && data.noKk.trim().length > 0) {
            const existingKk = await this.prisma.kartuKeluarga.findUnique({
                where: { noKk: data.noKk.trim() },
            });
            if (!existingKk) {
                const anggotaToCreate = [
                    {
                        nama: data.namaLengkap.trim(),
                        nik: data.nik?.trim() || null,
                        hubungan: 'KEPALA_KELUARGA',
                        noHp: data.phone.trim(),
                    },
                ];
                if (data.namaIstri && data.namaIstri.trim().length > 0) {
                    anggotaToCreate.push({
                        nama: data.namaIstri.trim(),
                        nik: null,
                        hubungan: 'ISTRI',
                        noHp: null,
                    });
                }
                if (data.anggotaKeluarga && data.anggotaKeluarga.length > 0) {
                    for (const namaAnak of data.anggotaKeluarga) {
                        if (namaAnak.trim().length > 0) {
                            anggotaToCreate.push({
                                nama: namaAnak.trim(),
                                nik: null,
                                hubungan: 'ANAK',
                                noHp: null,
                            });
                        }
                    }
                }
                await this.prisma.kartuKeluarga.create({
                    data: {
                        noKk: data.noKk.trim(),
                        rumahId: rumah.id,
                        namaKepala: data.namaLengkap.trim(),
                        anggota: {
                            create: anggotaToCreate,
                        },
                    },
                });
            }
        }
        const masterTagihan = await this.prisma.masterTagihan.findFirst({
            where: { rtId: rt.id, isActive: true },
        });
        if (masterTagihan) {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            await this.prisma.tagihanWarga.create({
                data: {
                    masterTagihanId: masterTagihan.id,
                    rumahId: rumah.id,
                    periodeBulan: currentMonth,
                    periodeTahun: currentYear,
                    nominalPokok: masterTagihan.nominalPokok,
                    adminFee: masterTagihan.adminFee,
                    totalBayar: Number(masterTagihan.nominalPokok) + Number(masterTagihan.adminFee),
                    status: client_1.StatusTagihan.UNPAID,
                    jatuhTempo: new Date(currentYear, currentMonth - 1, 10),
                },
            });
        }
        const { passwordHash: _, ...sanitized } = user;
        return {
            message: 'Warga baru berhasil ditambahkan ke RT!',
            user: sanitized,
            rumah,
        };
    }
    async getPengurusByRt(rtId) {
        const users = await this.prisma.user.findMany({
            where: {
                rtId,
                role: { in: [client_1.Role.ADMIN_RT, client_1.Role.BENDAHARA_RT, client_1.Role.SECURITY, client_1.Role.ADMIN_RW] },
            },
            include: { profile: true },
            orderBy: { role: 'asc' },
        });
        return users.map(u => {
            const { passwordHash, ...rest } = u;
            let jabatan = 'Pengurus RT';
            if (u.role === client_1.Role.ADMIN_RT)
                jabatan = 'Ketua RT';
            else if (u.role === client_1.Role.BENDAHARA_RT)
                jabatan = 'Bendahara RT';
            else if (u.role === client_1.Role.SECURITY)
                jabatan = 'Petugas Keamanan / Satpam';
            else if (u.role === client_1.Role.ADMIN_RW)
                jabatan = 'Ketua RW';
            return {
                ...rest,
                jabatan,
                nama: u.profile?.namaLengkap || 'Pengurus RT',
                noRumah: u.profile?.noRumah || '-',
            };
        });
    }
    async addOrUpdatePengurus(rtId, data) {
        let user = await this.prisma.user.findUnique({
            where: { phone: data.phone.trim() },
            include: { profile: true },
        });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('Password123!', salt);
            const rt = await this.prisma.rT.findUnique({ where: { id: rtId }, include: { rw: true } });
            if (!rt)
                throw new common_1.BadRequestException('RT tidak ditemukan');
            user = await this.prisma.user.create({
                data: {
                    phone: data.phone.trim(),
                    email: data.email?.trim() || null,
                    passwordHash,
                    role: data.role || client_1.Role.ADMIN_RT,
                    rtId: rt.id,
                    rwId: rt.rwId,
                    kelurahanId: rt.rw.kelurahanId,
                    profile: {
                        create: {
                            namaLengkap: data.namaLengkap.trim(),
                            noRumah: data.noRumah?.trim() || 'Blok Pengurus',
                        },
                    },
                },
                include: { profile: true },
            });
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    role: data.role || client_1.Role.ADMIN_RT,
                    rtId,
                    profile: {
                        upsert: {
                            create: {
                                namaLengkap: data.namaLengkap.trim(),
                                noRumah: data.noRumah?.trim() || 'Blok Pengurus',
                            },
                            update: {
                                namaLengkap: data.namaLengkap.trim(),
                                noRumah: data.noRumah?.trim() || user.profile?.noRumah,
                            },
                        },
                    },
                },
                include: { profile: true },
            });
        }
        const { passwordHash: _, ...sanitized } = user;
        return sanitized;
    }
    async deletePengurus(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role: client_1.Role.WARGA },
        });
    }
};
exports.WilayahService = WilayahService;
exports.WilayahService = WilayahService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WilayahService);
//# sourceMappingURL=wilayah.service.js.map