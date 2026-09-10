import { TagihanService } from './tagihan.service';
import { PaymentMethod } from '@prisma/client';
export declare class TagihanController {
    private readonly tagihanService;
    constructor(tagihanService: TagihanService);
    getMaster(user: any): Promise<{
        id: string;
        isActive: boolean;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        namaTagihan: string;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        deskripsi: string | null;
    }[]>;
    setMaster(user: any, body: {
        namaTagihan?: string;
        nominalPokok: number;
        deskripsi?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        namaTagihan: string;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
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
        transaksi: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            totalBayar: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paidAt: Date | null;
            tagihanId: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentCode: string | null;
            referenceId: string | null;
            buktiBayarUrl: string | null;
        }[];
        masterTagihan: {
            id: string;
            isActive: boolean;
            rtId: string;
            createdAt: Date;
            updatedAt: Date;
            namaTagihan: string;
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            deskripsi: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        rumahId: string;
        masterTagihanId: string;
        periodeBulan: number;
        periodeTahun: number;
        totalBayar: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.StatusTagihan;
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
