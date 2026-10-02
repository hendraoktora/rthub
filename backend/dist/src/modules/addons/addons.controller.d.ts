import { AddonsService } from './addons.service';
export declare class AddonsController {
    private readonly addonsService;
    constructor(addonsService: AddonsService);
    getMyRtAddonStatus(user: any): Promise<{
        rtId: any;
        paket: string;
        status: string;
        isPro: boolean;
        message: string;
    } | {
        isPro: boolean;
        rtId: string;
        nomorRt?: string;
        nomorRw?: string;
        kelurahan?: string;
        paket: "BASIC" | "PRO";
        status: "AKTIF" | "TRIAL" | "TIDAK_AKTIF";
        activatedAt: string;
        expiredAt: string | null;
        updatedAt: string;
        updatedBy?: string;
        message?: undefined;
    }>;
    getRtAddonStatus(rtId: string): Promise<{
        isPro: boolean;
        rtId: string;
        nomorRt?: string;
        nomorRw?: string;
        kelurahan?: string;
        paket: "BASIC" | "PRO";
        status: "AKTIF" | "TRIAL" | "TIDAK_AKTIF";
        activatedAt: string;
        expiredAt: string | null;
        updatedAt: string;
        updatedBy?: string;
    }>;
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
    getMyMembershipSummary(user: any): Promise<{
        subscription: any;
        userAds: {
            id: string;
            judul: string;
            harga: number;
            fotoUrl: string;
            isPromoted: boolean;
            promotedBadge: string;
            paketIklan: string;
            promotedUntil: string;
            sisaHariIklan: number;
            isExpiringSoon: boolean;
            isExpired: boolean;
        }[];
        alerts: {
            id: string;
            type: "SUBSCRIPTION" | "ADS" | "TRIAL_EXPIRING" | "RT_DEACTIVATED";
            severity: "warning" | "danger" | "info";
            title: string;
            message: string;
            actionText: string;
            meta?: any;
        }[];
    }>;
    renewPro(user: any, body: {
        rtId?: string;
        durationDays?: number;
    }): Promise<import("./addons.service").RtSubscriptionRecord>;
    updateSubscription(user: any, body: {
        rtId: string;
        status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF';
        durationDays?: number;
        paket?: 'BASIC' | 'PRO';
    }): Promise<import("./addons.service").RtSubscriptionRecord>;
}
