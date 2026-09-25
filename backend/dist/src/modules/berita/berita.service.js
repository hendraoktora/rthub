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
exports.BeritaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notification_service_1 = require("../notification/notification.service");
let BeritaService = class BeritaService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async getFeed(user) {
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
        return this.prisma.berita.findMany({
            where: { OR: orConditions },
            include: {
                author: { select: { profile: { select: { namaLengkap: true } }, role: true } },
            },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async createBerita(user, data) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { rt: { include: { rw: true } } },
        });
        const rtId = dbUser?.rtId || user?.rtId;
        const rwId = dbUser?.rwId || dbUser?.rt?.rwId || user?.rwId;
        const kelurahanId = dbUser?.kelurahanId || dbUser?.rt?.rw?.kelurahanId || user?.kelurahanId;
        const berita = await this.prisma.berita.create({
            data: {
                authorId: user.id,
                judul: data.judul,
                konten: data.konten,
                scope: data.scope,
                rtId: rtId || null,
                rwId: rwId || null,
                kelurahanId: kelurahanId || null,
                coverUrl: data.coverUrl || null,
                isPinned: data.isPinned ?? false,
            },
        });
        try {
            const snippet = data.konten.replace(/<[^>]*>?/gm, '').trim();
            const bodyPreview = snippet.length > 120 ? `${snippet.substring(0, 117)}...` : snippet;
            if (data.scope === client_1.ScopeWilayah.RT && user.rtId) {
                await this.notificationService.sendToTopic(`rt_${user.rtId}`, `📢 ${data.judul}`, bodyPreview || 'Ada pengumuman lingkungan baru untuk warga RT Anda.', {
                    type: 'BERITA',
                    beritaId: berita.id,
                    scope: data.scope,
                });
            }
            else if (data.scope === client_1.ScopeWilayah.RW && user.rwId) {
                await this.notificationService.sendToTopic(`rw_${user.rwId}`, `📢 ${data.judul}`, bodyPreview || 'Ada pengumuman lingkungan baru untuk warga RW Anda.', {
                    type: 'BERITA',
                    beritaId: berita.id,
                    scope: data.scope,
                });
            }
            else {
                await this.notificationService.sendToTopic('rthub_broadcast', `📢 ${data.judul}`, bodyPreview || 'Ada pengumuman lingkungan baru untuk warga.', {
                    type: 'BERITA',
                    beritaId: berita.id,
                    scope: data.scope,
                });
            }
        }
        catch (_) { }
        return berita;
    }
    async updateBerita(id, user, data) {
        return this.prisma.berita.update({
            where: { id },
            data: {
                ...(data.judul ? { judul: data.judul } : {}),
                ...(data.konten ? { konten: data.konten } : {}),
                ...(data.scope ? {
                    scope: data.scope,
                    rtId: data.scope === client_1.ScopeWilayah.RT ? user.rtId : null,
                    rwId: data.scope === client_1.ScopeWilayah.RW ? user.rwId : null,
                    kelurahanId: data.scope === client_1.ScopeWilayah.KELURAHAN ? user.kelurahanId : null,
                } : {}),
                ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
                ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
            },
        });
    }
    async deleteBerita(id, user) {
        return this.prisma.berita.delete({
            where: { id },
        });
    }
};
exports.BeritaService = BeritaService;
exports.BeritaService = BeritaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], BeritaService);
//# sourceMappingURL=berita.service.js.map