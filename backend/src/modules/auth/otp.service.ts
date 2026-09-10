import { Injectable, Logger, BadRequestException } from '@nestjs/common';

interface OtpRecord {
  code: string;
  target: string;
  channel: 'WHATSAPP' | 'EMAIL';
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpStore = new Map<string, OtpRecord>();

  /**
   * Kirim Kode OTP ke WhatsApp atau Email
   */
  async sendOtp(target: string, channel: 'WHATSAPP' | 'EMAIL' = 'WHATSAPP', purpose: string = 'REGISTRASI') {
    const cleanTarget = target.trim();
    if (!cleanTarget) {
      throw new BadRequestException('Nomor WhatsApp atau Email tujuan wajib diisi.');
    }

    // Generate 6-Digit random secure OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

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
    } else {
      this.logger.log(`✉️ [EMAIL OTP GATEWAY] Mengirim OTP [${code}] ke ${cleanTarget} untuk keperluan ${purpose}`);
    }

    return {
      success: true,
      message: `Kode OTP 6-digit berhasil dikirim ke ${channel === 'WHATSAPP' ? 'nomor WhatsApp' : 'email'} ${masked}.`,
      targetMasked: masked,
      channel,
      expiresInSeconds: 300,
      // Kode OTP disediakan untuk kemudahan uji coba / demo live
      demoOtp: code,
    };
  }

  /**
   * Verifikasi Kode OTP
   */
  async verifyOtp(target: string, code: string): Promise<boolean> {
    const cleanTarget = target.trim();
    const record = this.otpStore.get(cleanTarget);

    if (!record) {
      throw new BadRequestException('Kode OTP belum dikirim atau telah kedaluwarsa. Silakan minta kode baru.');
    }

    if (new Date() > record.expiresAt) {
      this.otpStore.delete(cleanTarget);
      throw new BadRequestException('Kode OTP telah kedaluwarsa. Silakan minta kode baru.');
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      this.otpStore.delete(cleanTarget);
      throw new BadRequestException('Terlalu banyak percobaan salah. Silakan minta kode OTP baru.');
    }

    // Support standard dynamic OTP or universal demo OTP '123456' for ease of testing
    if (record.code === code.trim() || code.trim() === '123456') {
      this.otpStore.delete(cleanTarget);
      this.logger.log(`✅ [OTP VERIFIED] Target ${cleanTarget} berhasil terverifikasi.`);
      return true;
    }

    throw new BadRequestException('Kode OTP yang Anda masukkan salah. Silakan periksa kembali.');
  }

  private maskTarget(target: string, channel: 'WHATSAPP' | 'EMAIL'): string {
    if (channel === 'EMAIL') {
      const [name, domain] = target.split('@');
      if (!domain) return target;
      const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : name;
      return `${maskedName}@${domain}`;
    } else {
      const digits = target.replace(/[^0-9]/g, '');
      if (digits.length >= 8) {
        return `${digits.slice(0, 4)}****${digits.slice(-4)}`;
      }
      return target;
    }
  }
}
