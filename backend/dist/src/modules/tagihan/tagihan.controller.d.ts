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
        id: string;
        isActive: boolean;
        rtId: string;
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
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentCode: string | null;
            referenceId: string | null;
            buktiBayarUrl: string | null;
            tagihanId: string;
        }[];
        masterTagihan: {
            id: string;
            isActive: boolean;
            rtId: string;
            createdAt: Date;
            updatedAt: Date;
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            namaTagihan: string;
            deskripsi: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        masterTagihanId: string;
        rumahId: string;
        periodeBulan: number;
        periodeTahun: number;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        totalBayar: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.StatusTagihan;
        jatuhTempo: Date;
        paidAt: Date | null;
    })[]>;
    getPendingVerifikasi(user: any): Promise<({
        user: {
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                namaLengkap: string;
                nik: string | null;
                noKk: string | null;
                noRumah: string | null;
                avatarUrl: string | null;
                skDokumenUrl: string | null;
                dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            phone: string;
            email: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            kelurahanId: string | null;
            rwId: string | null;
            rtId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        tagihan: {
            rumah: {
                id: string;
                rtId: string;
                createdAt: Date;
                updatedAt: Date;
                noRumah: string;
                alamatLengkap: string | null;
                statusHunian: string | null;
            };
            masterTagihan: {
                id: string;
                isActive: boolean;
                rtId: string;
                createdAt: Date;
                updatedAt: Date;
                nominalPokok: import("@prisma/client/runtime/library").Decimal;
                adminFee: import("@prisma/client/runtime/library").Decimal;
                namaTagihan: string;
                deskripsi: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            masterTagihanId: string;
            rumahId: string;
            periodeBulan: number;
            periodeTahun: number;
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            totalBayar: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.StatusTagihan;
            jatuhTempo: Date;
            paidAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        nominalPokok: import("@prisma/client/runtime/library").Decimal;
        adminFee: import("@prisma/client/runtime/library").Decimal;
        totalBayar: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.PaymentStatus;
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
            nominalPokok: import("@prisma/client/runtime/library").Decimal;
            adminFee: import("@prisma/client/runtime/library").Decimal;
            totalBayar: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.PaymentStatus;
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
