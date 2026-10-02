import { TagihanService } from './tagihan.service';
import { PaymentMethod } from '@prisma/client';
export declare class TagihanController {
    private readonly tagihanService;
    constructor(tagihanService: TagihanService);
    getMaster(user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rtId: string;
        isActive: boolean;
        deskripsi: string | null;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        namaTagihan: string;
    }[]>;
    setMaster(user: any, body: {
        namaTagihan?: string;
        nominalPokok: number;
        deskripsi?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rtId: string;
        isActive: boolean;
        deskripsi: string | null;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        namaTagihan: string;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rtId: string;
            isActive: boolean;
            deskripsi: string | null;
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            namaTagihan: string;
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
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentCode: string | null;
            referenceId: string | null;
            buktiBayarUrl: string | null;
            tagihanId: string;
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
    getPendingVerifikasi(user: any): Promise<({
        user: {
            profile: {
                id: string;
                skDokumenUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
                namaLengkap: string;
                nik: string | null;
                noRumah: string | null;
                noKk: string | null;
                userId: string;
                avatarUrl: string | null;
                dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            rwId: string | null;
            createdAt: Date;
            updatedAt: Date;
            rtId: string | null;
            phone: string;
            email: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            kelurahanId: string | null;
        };
        tagihan: {
            rumah: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                rtId: string;
                noRumah: string;
                alamatLengkap: string | null;
                statusHunian: string | null;
            };
            masterTagihan: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                rtId: string;
                isActive: boolean;
                deskripsi: string | null;
                nominalPokok: import("@prisma/client/runtime/library").Decimal;
                adminFee: import("@prisma/client/runtime/library").Decimal;
                namaTagihan: string;
            };
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        totalBayar: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentCode: string | null;
        referenceId: string | null;
        buktiBayarUrl: string | null;
        tagihanId: string;
    })[]>;
    getInstruksi(id: string): Promise<{
        tagihanId: string;
        namaTagihan: string;
        periode: string;
        nominal: number;
        status: import(".prisma/client").$Enums.StatusTagihan;
        rumah: string;
        jatuhTempo: Date;
        rekeningRT: {
            namaBank: string;
            nomorRekening: string;
            atasNamaRekening: string;
            qrisImageUrl: string;
        };
        transaksiTerakhir: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            totalBayar: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentCode: string | null;
            referenceId: string | null;
            buktiBayarUrl: string | null;
            tagihanId: string;
        };
    }>;
    konfirmasiBayar(id: string, user: any, body: {
        paymentMethod: PaymentMethod;
        buktiBayarUrl?: string;
        catatan?: string;
    }): Promise<{
        message: string;
        transaksiId: string;
        status: string;
    }>;
    terimaTunai(id: string, user: any): Promise<{
        message: string;
        tagihanId: string;
        nominal: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }>;
    approveTransaksi(transaksiId: string, user: any): Promise<{
        message: string;
        status: string;
    }>;
    bayar(id: string, user: any, body: {
        paymentMethod: PaymentMethod;
    }): Promise<{
        message: string;
        rincian: {
            tagihan: string;
            nominalIuranPokokMasukKasRT: import("@prisma/client/runtime/library").Decimal;
            totalBayar: import("@prisma/client/runtime/library").Decimal;
            metodeBayar: import(".prisma/client").$Enums.PaymentMethod;
            status: string;
        };
    }>;
}
