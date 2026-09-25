import { PrismaService } from '../../prisma/prisma.service';
export interface RtSubscriptionRecord {
    rtId: string;
    nomorRt?: string;
    nomorRw?: string;
    kelurahan?: string;
    paket: 'BASIC' | 'PRO';
    status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF';
    activatedAt: string;
    expiredAt: string | null;
    updatedAt: string;
    updatedBy?: string;
}
export declare class AddonsService {
    private prisma;
    private readonly logger;
    private static subscriptions;
    constructor(prisma: PrismaService);
    private static getStoragePath;
    static loadFromDisk(): void;
    static saveToDisk(): void;
    isRtProActive(rtId: string): Promise<boolean>;
    getRtSubscription(rtId: string): Promise<RtSubscriptionRecord>;
    getAllRtSubscriptions(): Promise<{
        rtNomor: string;
        rwNomor: string;
        kelurahan: string;
        kota: string;
        namaJalan: string;
        ketua: string;
        phone: string;
        wargaCount: number;
        rumahCount: number;
        rtId: string;
        nomorRt?: string;
        nomorRw?: string;
        paket: "BASIC" | "PRO";
        status: "AKTIF" | "TRIAL" | "TIDAK_AKTIF";
        activatedAt: string;
        expiredAt: string | null;
        updatedAt: string;
        updatedBy?: string;
    }[]>;
    updateSubscription(rtId: string, data: {
        status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF';
        paket?: 'BASIC' | 'PRO';
        durationDays?: number;
        updatedBy?: string;
    }): Promise<RtSubscriptionRecord>;
}
