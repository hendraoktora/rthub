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
        const now = new Date();
        const trialExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const defaultSub = {
            rtId,
            nomorRt: rt?.nomor || '03',
            nomorRw: rt?.rw?.nomor || '05',
            kelurahan: rt?.rw?.kelurahan?.nama || 'Sukamaju',
            paket: 'PRO',
            status: 'TRIAL',
            activatedAt: now.toISOString(),
            expiredAt: trialExpiry.toISOString(),
            updatedAt: now.toISOString(),
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
            const isCurrentlyActive = existing.status === 'AKTIF' && existing.expiredAt && new Date(existing.expiredAt).getTime() > now.getTime();
            const baseTime = isCurrentlyActive ? new Date(existing.expiredAt).getTime() : now.getTime();
            const exp = new Date(baseTime + days * 24 * 60 * 60 * 1000);
            expiredAt = exp.toISOString();
        }
        else if (data.status === 'TRIAL') {
            const days = data.durationDays || 14;
            const isCurrentlyTrial = existing.status === 'TRIAL' && existing.expiredAt && new Date(existing.expiredAt).getTime() > now.getTime();
            const baseTime = isCurrentlyTrial ? new Date(existing.expiredAt).getTime() : now.getTime();
            const exp = new Date(baseTime + days * 24 * 60 * 60 * 1000);
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
    async getMyMembershipAndAdsSummary(userId, rtId) {
        const now = new Date();
        let subscriptionInfo = null;
        if (rtId) {
            const sub = await this.getRtSubscription(rtId);
            const isPro = await this.isRtProActive(rtId);
            let sisaHari = 0;
            let isExpiringSoon = false;
            let isExpired = false;
            if (sub.expiredAt) {
                const expTime = new Date(sub.expiredAt).getTime();
                const diffMs = expTime - now.getTime();
                if (diffMs > 0) {
                    sisaHari = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
                    if (sisaHari <= 5) {
                        isExpiringSoon = true;
                    }
                }
                else {
                    isExpired = true;
                }
            }
            else if (sub.status === 'TIDAK_AKTIF') {
                isExpired = true;
            }
            subscriptionInfo = {
                ...sub,
                isPro,
                sisaHari,
                isExpiringSoon,
                isExpired,
                renewalFee: 99000,
            };
        }
        const myLapak = await this.prisma.lapakProduk.findMany({
            where: { sellerId: userId },
            orderBy: { createdAt: 'desc' },
        });
        const userAds = myLapak.map((p) => {
            const isPromoted = Boolean(p.isPromoted && p.promotedUntil && new Date(p.promotedUntil) > now);
            let sisaHariIklan = 0;
            let isExpiringSoon = false;
            let isExpired = false;
            if (p.promotedUntil) {
                const expTime = new Date(p.promotedUntil).getTime();
                const diffMs = expTime - now.getTime();
                if (diffMs > 0) {
                    sisaHariIklan = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
                    if (sisaHariIklan <= 3) {
                        isExpiringSoon = true;
                    }
                }
                else {
                    isExpired = true;
                }
            }
            return {
                id: p.id,
                judul: p.judul,
                harga: Number(p.harga),
                fotoUrl: p.fotoUrl,
                isPromoted,
                promotedBadge: p.promotedBadge,
                paketIklan: p.paketIklan,
                promotedUntil: p.promotedUntil ? p.promotedUntil.toISOString() : null,
                sisaHariIklan,
                isExpiringSoon,
                isExpired,
            };
        });
        const alerts = [];
        if (subscriptionInfo && rtId) {
            const isTrial = subscriptionInfo.status === 'TRIAL';
            const isExpired = subscriptionInfo.isExpired;
            if (isExpired) {
                subscriptionInfo.isDeactivated = true;
                if (AddonsService_1.subscriptions[rtId]) {
                    AddonsService_1.subscriptions[rtId].status = 'TIDAK_AKTIF';
                    AddonsService_1.saveToDisk();
                }
                alerts.push({
                    id: 'alert-rt-deactivated',
                    type: 'RT_DEACTIVATED',
                    severity: 'danger',
                    title: 'Akun RT Dinonaktifkan Otomatis',
                    message: `Masa aktif ${isTrial ? 'Trial 7 Hari' : 'Langganan Pro'} RT Anda telah berakhir. Seluruh isi dan fitur akun di RT ini dinonaktifkan sementara. Segera lakukan pembayaran Pro Rp 99.000 / bln untuk mengaktifkan kembali seluruh akun RT.`,
                    actionText: 'Aktifkan Akun RT (Rp 99rb)',
                    meta: { rtId },
                });
            }
            else if (isTrial && subscriptionInfo.sisaHari <= 3) {
                alerts.push({
                    id: 'alert-trial-expiring',
                    type: 'TRIAL_EXPIRING',
                    severity: 'warning',
                    title: `Masa Trial RT Pro Tersisa ${subscriptionInfo.sisaHari} Hari!`,
                    message: `Masa uji coba gratis RT Pro Anda tersisa ${subscriptionInfo.sisaHari} hari lagi. Segera upgrade ke akun Pro (Rp 99.000 / bln) agar akun RT dan seluruh data warga tidak dinonaktifkan otomatis.`,
                    actionText: 'Upgrade ke Pro (Rp 99rb)',
                    meta: { rtId, sisaHari: subscriptionInfo.sisaHari },
                });
            }
            else if (!isTrial && subscriptionInfo.isExpiringSoon) {
                alerts.push({
                    id: 'alert-sub-expiring',
                    type: 'SUBSCRIPTION',
                    severity: 'warning',
                    title: 'Masa Aktif Pro Segera Berakhir',
                    message: `Langganan RTHub Pro RT Anda tersisa ${subscriptionInfo.sisaHari} hari lagi. Perpanjang sekarang agar akses surat digital & kas RT tidak terputus.`,
                    actionText: 'Perpanjang (Rp 99rb)',
                    meta: { rtId, sisaHari: subscriptionInfo.sisaHari },
                });
            }
        }
        userAds.forEach((ad) => {
            if (ad.isExpiringSoon) {
                alerts.push({
                    id: `alert-ad-expiring-${ad.id}`,
                    type: 'ADS',
                    severity: 'warning',
                    title: 'Iklan Sponsor Segera Berakhir',
                    message: `Masa tayang iklan "${ad.judul}" tersisa ${ad.sisaHariIklan} hari lagi. Perpanjang durasi agar produk tetap berada di posisi prioritas.`,
                    actionText: 'Tambah Durasi Iklan',
                    meta: { lapakId: ad.id, judul: ad.judul, sisaHari: ad.sisaHariIklan },
                });
            }
            else if (ad.isExpired && ad.isPromoted) {
                alerts.push({
                    id: `alert-ad-expired-${ad.id}`,
                    type: 'ADS',
                    severity: 'info',
                    title: 'Masa Tayang Iklan Selesai',
                    message: `Iklan sponsor untuk "${ad.judul}" telah selesai tayang. Pasang iklan kembali untuk memaksimalkan promosi ke warga.`,
                    actionText: 'Pasang Iklan Lagi',
                    meta: { lapakId: ad.id, judul: ad.judul },
                });
            }
        });
        return {
            subscription: subscriptionInfo,
            userAds,
            alerts,
        };
    }
};
exports.AddonsService = AddonsService;
AddonsService.subscriptions = {};
exports.AddonsService = AddonsService = AddonsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddonsService);
//# sourceMappingURL=addons.service.js.map