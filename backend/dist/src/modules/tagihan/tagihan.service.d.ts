import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';
export declare class TagihanService {
    private prisma;
    constructor(prisma: PrismaService);
    getMasterTagihan(rtId: string): Promise<{
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
    setMasterTagihan(rtId: string, data: {
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
    generateTagihanBulanan(rtId: string, masterTagihanId: string, bulan: number, tahun: number): Promise<{
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
    bayarTagihan(tagihanId: string, userId: string, paymentMethod: PaymentMethod): Promise<{
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
