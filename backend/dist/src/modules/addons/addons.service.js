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
var AddonsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AddonsService = AddonsService_1 = class AddonsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AddonsService_1.name);
        AddonsService_1.loadFromDisk();
    }
    static getStoragePath() {
        const dataDir = path.resolve(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            try {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            catch (_) { }
        }
        return path.join(dataDir, 'rt_subscriptions.json');
    }
    static loadFromDisk() {
        try {
            const filePath = AddonsService_1.getStoragePath();
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf-8');
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    AddonsService_1.subscriptions = parsed;
                }
            }
        }
        catch (e) {
            console.error('Failed to load RT subscriptions from disk:', e);
        }
    }
    static saveToDisk() {
        try {
            const filePath = AddonsService_1.getStoragePath();
            fs.writeFileSync(filePath, JSON.stringify(AddonsService_1.subscriptions, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save RT subscriptions to disk:', e);
        }
    }
    async isRtProActive(rtId) {
        if (!rtId)
            return false;
        const sub = await this.getRtSubscription(rtId);
        if (!sub)
            return false;
        if (sub.status === 'TIDAK_AKTIF' || sub.paket !== 'PRO') {
            return false;
        }
        if (sub.expiredAt) {
            const expireTime = new Date(sub.expiredAt).getTime();
            const now = Date.now();
            if (now > expireTime) {
                sub.status = 'TIDAK_AKTIF';
                AddonsService_1.subscriptions[rtId] = sub;
                AddonsService_1.saveToDisk();
                return false;
            }
        }
        return true;
    }
    async getRtSubscription(rtId) {
        if (AddonsService_1.subscriptions[rtId]) {
            const existing = AddonsService_1.subscriptions[rtId];
            if (existing.expiredAt && new Date(existing.expiredAt).getTime() < Date.now()) {
                existing.status = 'TIDAK_AKTIF';
                AddonsService_1.saveToDisk();
            }
            return existing;
        }
        const rt = await this.prisma.rT.findUnique({
            where: { id: rtId },
            include: { rw: { include: { kelurahan: true } } },
        });
        const defaultSub = {
            rtId,
            nomorRt: rt?.nomor || '03',
            nomorRw: rt?.rw?.nomor || '05',
            kelurahan: rt?.rw?.kelurahan?.nama || 'Sukamaju',
            paket: 'BASIC',
            status: 'TIDAK_AKTIF',
            activatedAt: new Date().toISOString(),
            expiredAt: null,
            updatedAt: new Date().toISOString(),
        };
        AddonsService_1.subscriptions[rtId] = defaultSub;
        AddonsService_1.saveToDisk();
        return defaultSub;
    }
    async getAllRtSubscriptions() {
        const allRts = await this.prisma.rT.findMany({
            include: {
                rw: { include: { kelurahan: true } },
                users: {
                    take: 1,
                    include: { profile: true },
                },
                _count: {
                    select: { users: true, rumah: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return allRts.map((rt) => {
            let sub = AddonsService_1.subscriptions[rt.id];
            if (!sub) {
                sub = {
                    rtId: rt.id,
                    nomorRt: rt.nomor,
                    nomorRw: rt.rw?.nomor || '01',
                    kelurahan: rt.rw?.kelurahan?.nama || '-',
                    paket: 'BASIC',
                    status: 'TIDAK_AKTIF',
                    activatedAt: rt.createdAt.toISOString(),
                    expiredAt: null,
                    updatedAt: rt.createdAt.toISOString(),
                };
                AddonsService_1.subscriptions[rt.id] = sub;
            }
            if (sub.expiredAt && new Date(sub.expiredAt).getTime() < Date.now()) {
                sub.status = 'TIDAK_AKTIF';
            }
            const ketua = rt.users[0]?.profile?.namaLengkap || 'Pengurus RT';
            const phone = rt.users[0]?.phone || '-';
            return {
                ...sub,
                rtNomor: rt.nomor,
                rwNomor: rt.rw?.nomor || '-',
                kelurahan: rt.rw?.kelurahan?.nama || '-',
                kota: rt.rw?.kelurahan?.kota || 'Depok',
                namaJalan: rt.namaJalan || `RT ${rt.nomor}`,
                ketua,
                phone,
                wargaCount: rt._count.users,
                rumahCount: rt._count.rumah,
            };
        });
    }
    async updateSubscription(rtId, data) {
        const existing = await this.getRtSubscription(rtId);
        const now = new Date();
        let expiredAt = null;
        if (data.status === 'AKTIF') {
            const days = data.durationDays || 30;
            const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            expiredAt = exp.toISOString();
        }
        else if (data.status === 'TRIAL') {
            const days = data.durationDays || 14;
            const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            expiredAt = exp.toISOString();
        }
        else {
            expiredAt = null;
        }
        const updated = {
            ...existing,
            paket: data.status === 'TIDAK_AKTIF' ? 'BASIC' : (data.paket || 'PRO'),
            status: data.status,
            expiredAt,
            updatedAt: now.toISOString(),
            updatedBy: data.updatedBy || 'SUPERADMIN',
        };
        AddonsService_1.subscriptions[rtId] = updated;
        AddonsService_1.saveToDisk();
        return updated;
    }
};
exports.AddonsService = AddonsService;
AddonsService.subscriptions = {};
exports.AddonsService = AddonsService = AddonsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddonsService);
//# sourceMappingURL=addons.service.js.map