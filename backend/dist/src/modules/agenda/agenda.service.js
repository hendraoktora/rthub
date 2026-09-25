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
exports.AgendaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AgendaService = class AgendaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAgenda(user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        const rtId = dbUser?.rtId || user?.rtId;
        const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        const orConditions = [];
        if (rtId && rwId && kelurahanId) {
            orConditions.push({ scope: client_1.ScopeWilayah.RT, rtId, rwId, kelurahanId });
        }
        else if (rtId) {
            orConditions.push({ scope: client_1.ScopeWilayah.RT, rtId });
        }
        if (rwId && kelurahanId) {
            orConditions.push({ scope: client_1.ScopeWilayah.RW, rwId, kelurahanId });
        }
        else if (rwId) {
            orConditions.push({ scope: client_1.ScopeWilayah.RW, rwId });
        }
        if (kelurahanId) {
            orConditions.push({ scope: client_1.ScopeWilayah.KELURAHAN, kelurahanId });
        }
        if (orConditions.length === 0) {
            return [];
        }
        return this.prisma.agendaKegiatan.findMany({
            where: { OR: orConditions },
            orderBy: { tanggalMulai: 'asc' },
        });
    }
    async createAgenda(user, data) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        const rtId = dbUser?.rtId || user?.rtId;
        const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        const scope = data.scope || client_1.ScopeWilayah.RT;
        return this.prisma.agendaKegiatan.create({
            data: {
                judul: data.judul,
                kategori: data.kategori || 'KERJA_BAKTI',
                deskripsi: data.deskripsi || null,
                tanggalMulai: new Date(data.tanggalMulai),
                tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
                lokasi: data.lokasi || null,
                scope,
                rtId: rtId || null,
                rwId: rwId || null,
                kelurahanId: kelurahanId || null,
            },
        });
    }
    async updateAgenda(id, user, data) {
        return this.prisma.agendaKegiatan.update({
            where: { id },
            data: {
                ...(data.judul ? { judul: data.judul } : {}),
                ...(data.kategori ? { kategori: data.kategori } : {}),
                ...(data.deskripsi !== undefined ? { deskripsi: data.deskripsi } : {}),
                ...(data.tanggalMulai ? { tanggalMulai: new Date(data.tanggalMulai) } : {}),
                ...(data.tanggalSelesai !== undefined
                    ? { tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null }
                    : {}),
                ...(data.lokasi !== undefined ? { lokasi: data.lokasi } : {}),
            },
        });
    }
    async deleteAgenda(id, user) {
        return this.prisma.agendaKegiatan.delete({
            where: { id },
        });
    }
};
exports.AgendaService = AgendaService;
exports.AgendaService = AgendaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AgendaService);
//# sourceMappingURL=agenda.service.js.map