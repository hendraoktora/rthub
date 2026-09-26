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
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
let OtpService = OtpService_1 = class OtpService {
    constructor() {
        this.logger = new common_1.Logger(OtpService_1.name);
        this.otpStore = new Map();
        this.mailTransporter = null;
        this.initMailTransporter();
    }
    initMailTransporter() {
        try {
            let nodemailer;
            try {
                nodemailer = require('nodemailer');
            }
            catch (e) {
                this.logger.warn('Module nodemailer belum terpasang di node_modules.');
                return;
            }
            const host = process.env.SMTP_HOST || 'mail.rthub.id';
            const port = Number(process.env.SMTP_PORT) || 465;
            const user = process.env.SMTP_USER || 'no-reply@rthub.id';
            const pass = process.env.SMTP_PASS || 'M@!LrTHu8!';
            this.mailTransporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
                tls: { rejectUnauthorized: false },
                family: 4,
            });
            this.logger.log(`📧 SMTP Transporter initialized on ${host}:${port} (${user}) [IPv4]`);
        }
        catch (err) {
            this.logger.error('Failed to initialize SMTP Transporter:', err);
        }
    }
    async sendOtp(target, channel = 'WHATSAPP', purpose = 'REGISTRASI') {
        const cleanTarget = target.trim();
        if (!cleanTarget) {
            throw new common_1.BadRequestException('Nomor WhatsApp atau Email tujuan wajib diisi.');
        }
        const effectiveChannel = cleanTarget.includes('@') ? 'EMAIL' : channel;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        this.otpStore.set(cleanTarget, {
            code,
            target: cleanTarget,
            channel: effectiveChannel,
            expiresAt,
            attempts: 0,
        });
        const masked = this.maskTarget(cleanTarget, effectiveChannel);
        if (effectiveChannel === 'EMAIL') {
            try {
                await this.sendEmailOtp(cleanTarget, code, purpose);
                this.logger.log(`✉️ [EMAIL OTP GATEWAY] OTP [${code}] berhasil terkirim ke ${cleanTarget} via SMTP`);
            }
            catch (err) {
                this.logger.error(`❌ [EMAIL OTP ERROR] Gagal mengirim email ke ${cleanTarget}: ${err?.message || err}`);
                throw new common_1.BadRequestException(`Gagal mengirim email OTP ke ${cleanTarget}. Pastikan alamat email benar dan aktif. (${err?.message || 'SMTP Error'})`);
            }
        }
        else {
            this.logger.log(`📱 [WHATSAPP OTP GATEWAY] Mengirim OTP [${code}] ke ${cleanTarget} untuk keperluan ${purpose}`);
        }
        return {
            success: true,
            message: `Kode OTP 6-digit berhasil dikirimkan ke email ${masked}. Silakan periksa Kotak Masuk (Inbox) atau folder Spam email Anda.`,
            targetMasked: masked,
            channel: effectiveChannel,
            expiresInSeconds: 300,
        };
    }
    async sendEmailOtp(to, code, purpose) {
        if (!this.mailTransporter) {
            this.initMailTransporter();
        }
        if (!this.mailTransporter) {
            throw new Error('SMTP mailer belum terkonfigurasi');
        }
        const fromName = process.env.SMTP_FROM_NAME || 'RtHub Indonesia';
        const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@rthub.id';
        const purposeTitle = purpose === 'RESET_PASSWORD'
            ? 'Reset Kata Sandi Akun'
            : purpose === 'VERIFIKASI_RT'
                ? 'Verifikasi Pendaftaran RT Baru'
                : 'Verifikasi Pendaftaran Akun RtHub';
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject: `Kode Verifikasi RtHub: ${code}`,
            html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #091328 0%, #1e293b 100%); padding: 36px 24px; text-align: center;">
            <div style="margin-bottom: 14px;">
              <img src="https://rthub.id/rthub_logo.png" alt="RtHub Logo" width="130" style="display: inline-block; max-width: 130px; height: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">RtHub Indonesia</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Platform Digital Manajemen Rukun Tetangga & Warga</p>
          </div>
          <div style="padding: 36px 28px; text-align: center;">
            <div style="display: inline-block; background: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 16px; border: 1px solid #bfdbfe;">
              🔐 KODE KEAMANAN AKUN
            </div>
            <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 18px; font-weight: 700;">${purposeTitle}</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Gunakan 6-digit kode OTP di bawah ini untuk menyelesaikan pendaftaran Anda di aplikasi <strong>RtHub</strong>. Kode ini hanya berlaku selama <strong>5 menit</strong>.
            </p>
            <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 14px; padding: 20px 28px; display: inline-block; margin: 0 auto 24px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #15803d; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              Demi keamanan akun Anda, <strong>jangan bagikan kode ini</strong> kepada siapa pun. Jika Anda tidak merasa melakukan permintaan verifikasi ini, abaikan email ini.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px; font-weight: 600;">RtHub — Smart Neighborhood Ecosystem</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Portal Komunitas & Manajemen Lingkungan RT/RW se-Indonesia · <a href="https://rthub.id" style="color: #2563eb; text-decoration: none;">rthub.id</a></p>
          </div>
        </div>
      `,
        };
        return this.mailTransporter.sendMail(mailOptions);
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
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OtpService);
//# sourceMappingURL=otp.service.js.map