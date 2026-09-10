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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async registerRT(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Nomor WhatsApp sudah terdaftar.');
        }
        if (dto.nik && dto.nik.trim().length === 16) {
            const cleanNik = dto.nik.trim();
            const existingNik = await this.prisma.profile.findFirst({
                where: { nik: cleanNik },
            });
            if (existingNik) {
                throw new common_1.BadRequestException(`NIK ${cleanNik} sudah terdaftar dalam sistem. Tidak boleh menggunakan NIK yang sama.`);
            }
        }
        const namaKelurahan = dto.namaKelurahan.trim();
        const nomorRw = dto.nomorRw.trim();
        const nomorRt = dto.nomorRt.trim();
        let kelurahan = await this.prisma.kelurahan.findFirst({
            where: {
                nama: { equals: namaKelurahan },
                ...(dto.kecamatan ? { kecamatan: { equals: dto.kecamatan.trim() } } : {}),
            },
        });
        if (!kelurahan) {
            kelurahan = await this.prisma.kelurahan.create({
                data: {
                    nama: namaKelurahan,
                    kecamatan: dto.kecamatan?.trim() || null,
                    kota: dto.kota?.trim() || null,
                },
            });
        }
        let rw = await this.prisma.rW.findFirst({
            where: {
                nomor: nomorRw,
                kelurahanId: kelurahan.id,
            },
        });
        if (!rw) {
            rw = await this.prisma.rW.create({
                data: {
                    nomor: nomorRw,
                    kelurahanId: kelurahan.id,
                },
            });
        }
        let rt = await this.prisma.rT.findFirst({
            where: {
                nomor: nomorRt,
                rwId: rw.id,
            },
        });
        if (rt) {
            const existingAdmin = await this.prisma.user.findFirst({
                where: {
                    rtId: rt.id,
                    role: client_1.Role.ADMIN_RT,
                    isActive: true,
                },
            });
            if (existingAdmin) {
                throw new common_1.ConflictException(`RT ${nomorRt} di RW ${nomorRw} Kel. ${namaKelurahan} sudah terdaftar dengan Admin aktif.`);
            }
        }
        else {
            rt = await this.prisma.rT.create({
                data: {
                    nomor: nomorRt,
                    namaJalan: dto.namaJalan?.trim() || null,
                    skDokumenUrl: dto.skDokumenUrl || null,
                    rwId: rw.id,
                },
            });
        }
        await this.prisma.masterTagihan.createMany({
            data: [
                {
                    rtId: rt.id,
                    namaTagihan: 'Iuran Kas & Kebersihan Lingkungan',
                    nominalPokok: 50000.00,
                    adminFee: 2000.00,
                    deskripsi: 'Iuran kas operasional RT dan pengelolaan sampah bulanan',
                },
            ],
            skipDuplicates: true,
        });
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);
        const user = await this.prisma.user.create({
            data: {
                phone: dto.phone,
                email: dto.email || null,
                passwordHash,
                role: client_1.Role.ADMIN_RT,
                kelurahanId: kelurahan.id,
                rwId: rw.id,
                rtId: rt.id,
                profile: {
                    create: {
                        namaLengkap: dto.namaLengkap,
                        nik: dto.nik?.trim() || null,
                        skDokumenUrl: dto.skDokumenUrl || null,
                    },
                },
            },
            include: {
                profile: true,
                rt: true,
                rw: true,
                kelurahan: true,
            },
        });
        const token = this.generateToken(user.id, user.phone, user.role);
        return {
            message: 'Pendaftaran RT dan Akun Admin RT berhasil!',
            autoGrouped: {
                kelurahan: kelurahan.nama,
                rw: rw.nomor,
                rt: rt.nomor,
                isExistingRw: Boolean(rw),
            },
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }
    async registerWarga(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Nomor WhatsApp sudah terdaftar.');
        }
        if (dto.nik && dto.nik.trim().length === 16) {
            const cleanNik = dto.nik.trim();
            const existingNik = await this.prisma.profile.findFirst({
                where: { nik: cleanNik },
            });
            if (existingNik) {
                throw new common_1.BadRequestException(`NIK ${cleanNik} sudah terdaftar dalam sistem. Tidak boleh menggunakan NIK yang sama.`);
            }
        }
        const rt = await this.prisma.rT.findUnique({
            where: { id: dto.rtId },
            include: { rw: { include: { kelurahan: true } } },
        });
        if (!rt) {
            throw new common_1.BadRequestException('RT yang dipilih tidak ditemukan.');
        }
        let rumah = await this.prisma.rumah.findFirst({
            where: {
                rtId: rt.id,
                noRumah: dto.noRumah.trim(),
            },
        });
        if (!rumah) {
            rumah = await this.prisma.rumah.create({
                data: {
                    rtId: rt.id,
                    noRumah: dto.noRumah.trim(),
                    alamatLengkap: `${dto.noRumah.trim()}, RT ${rt.nomor}/RW ${rt.rw.nomor}`,
                },
            });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);
        const user = await this.prisma.user.create({
            data: {
                phone: dto.phone,
                email: dto.email || null,
                passwordHash,
                role: client_1.Role.WARGA,
                rtId: rt.id,
                rwId: rt.rwId,
                kelurahanId: rt.rw.kelurahanId,
                profile: {
                    create: {
                        namaLengkap: dto.namaLengkap,
                        noRumah: dto.noRumah.trim(),
                        nik: dto.nik?.trim() || null,
                        noKk: dto.noKk?.trim() || null,
                    },
                },
            },
            include: {
                profile: true,
                rt: true,
                rw: true,
                kelurahan: true,
            },
        });
        const token = this.generateToken(user.id, user.phone, user.role);
        return {
            message: 'Pendaftaran Warga berhasil!',
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ phone: dto.username }, { email: dto.username }],
            },
            include: {
                profile: true,
                rt: true,
                rw: true,
                kelurahan: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Nomor WhatsApp/Email atau kata sandi salah.');
        }
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Nomor WhatsApp/Email atau kata sandi salah.');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Akun Anda dinonaktifkan. Silakan hubungi Pengurus RT.');
        }
        const token = this.generateToken(user.id, user.phone, user.role);
        return {
            message: 'Login berhasil!',
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }
    async updateProfile(userId, data) {
        if (data.phone) {
            const existing = await this.prisma.user.findFirst({
                where: {
                    phone: data.phone.trim(),
                    NOT: { id: userId },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Nomor WhatsApp sudah digunakan oleh akun lain.');
            }
        }
        if (data.nik && data.nik.trim().length === 16) {
            const cleanNik = data.nik.trim();
            const existingNik = await this.prisma.profile.findFirst({
                where: {
                    nik: cleanNik,
                    userId: { not: userId },
                },
            });
            if (existingNik) {
                throw new common_1.BadRequestException(`NIK ${cleanNik} sudah digunakan oleh akun lain.`);
            }
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.phone ? { phone: data.phone.trim() } : {}),
                ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
                profile: {
                    upsert: {
                        create: {
                            namaLengkap: data.namaLengkap?.trim() || 'Warga RT',
                            noRumah: data.noRumah?.trim() || null,
                            nik: data.nik?.trim() || null,
                            noKk: data.noKk?.trim() || null,
                            avatarUrl: data.avatarUrl || null,
                        },
                        update: {
                            ...(data.namaLengkap ? { namaLengkap: data.namaLengkap.trim() } : {}),
                            ...(data.noRumah !== undefined ? { noRumah: data.noRumah?.trim() || null } : {}),
                            ...(data.nik !== undefined ? { nik: data.nik?.trim() || null } : {}),
                            ...(data.noKk !== undefined ? { noKk: data.noKk?.trim() || null } : {}),
                            ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
                        },
                    },
                },
            },
            include: {
                profile: true,
                rt: true,
                rw: true,
                kelurahan: true,
            },
        });
        return {
            message: 'Profil berhasil diperbarui di database!',
            user: this.sanitizeUser(user),
        };
    }
    async listPublicRt() {
        const rts = await this.prisma.rT.findMany({
            include: {
                rw: {
                    include: {
                        kelurahan: true,
                    },
                },
            },
            orderBy: [
                { rw: { kelurahan: { nama: 'asc' } } },
                { rw: { nomor: 'asc' } },
                { nomor: 'asc' },
            ],
        });
        return rts.map((rt) => ({
            id: rt.id,
            nomorRt: rt.nomor,
            nomorRw: rt.rw.nomor,
            namaKelurahan: rt.rw.kelurahan.nama,
            kecamatan: rt.rw.kelurahan.kecamatan,
            kota: rt.rw.kelurahan.kota,
            namaJalan: rt.namaJalan,
            label: `RT ${rt.nomor} / RW ${rt.rw.nomor} - Kel. ${rt.rw.kelurahan.nama} (${rt.rw.kelurahan.kota ?? ''})`,
        }));
    }
    async checkNikAvailable(nik, excludeUserId) {
        const cleanNik = nik.replace(/[^0-9]/g, '');
        if (cleanNik.length !== 16) {
            return { available: true, valid: false, message: 'Panjang NIK harus 16 digit' };
        }
        const existing = await this.prisma.profile.findFirst({
            where: {
                nik: cleanNik,
                ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
            },
            include: {
                user: { select: { phone: true, role: true } },
            },
        });
        if (existing) {
            return {
                available: false,
                valid: true,
                message: `NIK ${cleanNik} sudah terdaftar dalam sistem (Role: ${existing.user?.role ?? 'User'}).`,
            };
        }
        return {
            available: true,
            valid: true,
            message: 'NIK valid & tersedia untuk pendaftaran.',
        };
    }
    generateToken(userId, phone, role) {
        return this.jwtService.sign({ sub: userId, phone, role }, {
            secret: process.env.JWT_SECRET || 'rthub-super-secret-jwt-key-2026-production',
            expiresIn: '7d',
        });
    }
    sanitizeUser(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map