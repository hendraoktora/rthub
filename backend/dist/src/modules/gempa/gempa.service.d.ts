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
export declare class GempaService {
    private notificationService;
    private readonly logger;
    private cachedGempa;
    private lastFetchTime;
    private readonly CACHE_TTL_MS;
    constructor(notificationService: NotificationService);
    getGempaTerkini(): Promise<GempaData | null>;
    broadcastGempa(user: any, gempa: GempaData): Promise<{
        success: boolean;
        message: string;
        fcmResponse: string;
        gempa: GempaData;
    }>;
}
