import { TagihanService } from './tagihan.service';
import { PaymentMethod } from '@prisma/client';
export declare class TagihanController {
    private readonly tagihanService;
    constructor(tagihanService: TagihanService);
    getMaster(user: any): Promise<{
        rtId: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        namaTagihan: string;
        deskripsi: string | null;
    }[]>;
    setMaster(user: any, body: {
        namaTagihan?: string;
        nominalPokok: number;
        deskripsi?: string;
    }): Promise<{
        rtId: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        namaTagihan: string;
        deskripsi: string | null;
    }>;
    generateBulanan(user: any, body: {
        masterTagihanId: string;
        bulan: number;
        tahun: number;
    }): Promise<{
        message: string;
        bulan: number;
        tahun: number;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: string | number;
    }>;
    getTagihanSaya(user: any): Promise<({
        masterTagihan: {
            rtId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            namaTagihan: string;
            deskripsi: string | null;
        };
        transaksi: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            totalBayar: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            tagihanId: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentCode: string | null;
            referenceId: string | null;
            buktiBayarUrl: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusTagihan;
        masterTagihanId: string;
        rumahId: string;
        periodeBulan: number;
        periodeTahun: number;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        totalBayar: import("@prisma/client/runtime/library").Decimal;
        jatuhTempo: Date;
        paidAt: Date | null;
    })[]>;
    bayar(id: string, user: any, body: {
        paymentMethod: PaymentMethod;
    }): Promise<{
        message: string;
        rincian: {
            tagihan: string;
            nominalIuranPokokMasukKasRT: import("@prisma/client/runtime/library").Decimal;
            biayaLayananAdminPlatform: import("@prisma/client/runtime/library").Decimal;
            totalBayar: import("@prisma/client/runtime/library").Decimal;
            metodeBayar: import(".prisma/client").$Enums.PaymentMethod;
            status: string;
        };
    }>;
}
