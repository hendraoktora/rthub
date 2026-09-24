import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

export interface GempaData {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Dirasakan: string;
  Shakemap: string;
  ShakemapUrl?: string;
}

@Injectable()
export class GempaService {
  private readonly logger = new Logger(GempaService.name);
  private cachedGempa: GempaData | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 2 * 60 * 1000; // 2 menit cache

  constructor(private notificationService: NotificationService) {}

  async getGempaTerkini(): Promise<GempaData | null> {
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
    } catch (error) {
      this.logger.error('Failed to fetch gempa from BMKG:', error);
      return this.cachedGempa;
    }
  }

  async broadcastGempa(user: any, gempa: GempaData) {
    const title = `⚠️ INFO GEMPA M ${gempa.Magnitude}`;
    const body = `${gempa.Wilayah}. Kedalaman: ${gempa.Kedalaman}. ${gempa.Potensi}`;

    // Kirim notifikasi darurat / kewaspadaan ke seluruh warga
    const response = await this.notificationService.sendToTopic(
      'rthub_broadcast',
      title,
      body,
      {
        type: 'GEMPA',
        magnitude: gempa.Magnitude || '',
        wilayah: gempa.Wilayah || '',
        kedalaman: gempa.Kedalaman || '',
        potensi: gempa.Potensi || '',
        tanggal: gempa.Tanggal || '',
        jam: gempa.Jam || '',
        coordinates: gempa.Coordinates || '',
        shakemapUrl: gempa.ShakemapUrl || '',
      },
    );

    return {
      success: true,
      message: 'Notifikasi gempa bumi berhasil disiarkan ke seluruh HP warga.',
      fcmResponse: response,
      gempa,
    };
  }
}
