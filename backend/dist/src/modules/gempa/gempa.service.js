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
var GempaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GempaService = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("../notification/notification.service");
let GempaService = GempaService_1 = class GempaService {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(GempaService_1.name);
        this.cachedGempa = null;
        this.lastFetchTime = 0;
        this.CACHE_TTL_MS = 2 * 60 * 1000;
    }
    async getGempaTerkini() {
        const now = Date.now();
        if (this.cachedGempa && now - this.lastFetchTime < this.CACHE_TTL_MS) {
            return this.cachedGempa;
        }
        try {
            const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
            if (!response.ok) {
                throw new Error(`BMKG HTTP error: ${response.status}`);
            }
            const json = await response.json();
            const gempa = json?.Infogempa?.gempa;
            if (gempa) {
                if (gempa.Shakemap) {
                    gempa.ShakemapUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`;
                }
                this.cachedGempa = gempa;
                this.lastFetchTime = now;
                return gempa;
            }
            return this.cachedGempa;
        }
        catch (error) {
            this.logger.error('Failed to fetch gempa from BMKG:', error);
            return this.cachedGempa;
        }
    }
    async broadcastGempa(user, gempa) {
        const title = `⚠️ INFO GEMPA M ${gempa.Magnitude}`;
        const body = `${gempa.Wilayah}. Kedalaman: ${gempa.Kedalaman}. ${gempa.Potensi}`;
        const response = await this.notificationService.sendToTopic('rthub_broadcast', title, body, {
            type: 'GEMPA',
            magnitude: gempa.Magnitude || '',
            wilayah: gempa.Wilayah || '',
            kedalaman: gempa.Kedalaman || '',
            potensi: gempa.Potensi || '',
            tanggal: gempa.Tanggal || '',
            jam: gempa.Jam || '',
            coordinates: gempa.Coordinates || '',
            shakemapUrl: gempa.ShakemapUrl || '',
        });
        return {
            success: true,
            message: 'Notifikasi gempa bumi berhasil disiarkan ke seluruh HP warga.',
            fcmResponse: response,
            gempa,
        };
    }
};
exports.GempaService = GempaService;
exports.GempaService = GempaService = GempaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], GempaService);
//# sourceMappingURL=gempa.service.js.map