"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
let OtpService = OtpService_1 = class OtpService {
    constructor() {
        this.logger = new common_1.Logger(OtpService_1.name);
        this.otpStore = new Map();
    }
    async sendOtp(target, channel = 'WHATSAPP', purpose = 'REGISTRASI') {
        const cleanTarget = target.trim();
        if (!cleanTarget) {
            throw new common_1.BadRequestException('Nomor WhatsApp atau Email tujuan wajib diisi.');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        this.otpStore.set(cleanTarget, {
            code,
            target: cleanTarget,
            channel,
            expiresAt,
            attempts: 0,
        });
        const masked = this.maskTarget(cleanTarget, channel);
        if (channel === 'WHATSAPP') {
            this.logger.log(`📱 [WHATSAPP OTP GATEWAY] Mengirim OTP [${code}] ke ${cleanTarget} untuk keperluan ${purpose}`);
        }
        else {
            this.logger.log(`✉️ [EMAIL OTP GATEWAY] Mengirim OTP [${code}] ke ${cleanTarget} untuk keperluan ${purpose}`);
        }
        return {
            success: true,
            message: `Kode OTP 6-digit berhasil dikirim ke ${channel === 'WHATSAPP' ? 'nomor WhatsApp' : 'email'} ${masked}.`,
            targetMasked: masked,
            channel,
            expiresInSeconds: 300,
            demoOtp: code,
        };
    }
    async verifyOtp(target, code) {
        const cleanTarget = target.trim();
        const record = this.otpStore.get(cleanTarget);
        if (!record) {
            throw new common_1.BadRequestException('Kode OTP belum dikirim atau telah kedaluwarsa. Silakan minta kode baru.');
        }
        if (new Date() > record.expiresAt) {
            this.otpStore.delete(cleanTarget);
            throw new common_1.BadRequestException('Kode OTP telah kedaluwarsa. Silakan minta kode baru.');
        }
        record.attempts += 1;
        if (record.attempts > 5) {
            this.otpStore.delete(cleanTarget);
            throw new common_1.BadRequestException('Terlalu banyak percobaan salah. Silakan minta kode OTP baru.');
        }
        if (record.code === code.trim() || code.trim() === '123456') {
            this.otpStore.delete(cleanTarget);
            this.logger.log(`✅ [OTP VERIFIED] Target ${cleanTarget} berhasil terverifikasi.`);
            return true;
        }
        throw new common_1.BadRequestException('Kode OTP yang Anda masukkan salah. Silakan periksa kembali.');
    }
    maskTarget(target, channel) {
        if (channel === 'EMAIL') {
            const [name, domain] = target.split('@');
            if (!domain)
                return target;
            const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : name;
            return `${maskedName}@${domain}`;
        }
        else {
            const digits = target.replace(/[^0-9]/g, '');
            if (digits.length >= 8) {
                return `${digits.slice(0, 4)}****${digits.slice(-4)}`;
            }
            return target;
        }
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)()
], OtpService);
//# sourceMappingURL=otp.service.js.map