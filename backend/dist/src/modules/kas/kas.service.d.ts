import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipeKas } from '@prisma/client';
export declare class KasService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    getKasSummary(rtId?: string): Promise<{
        saldoKas: number;
        totalPemasukan: number;
        totalPengeluaran: number;
        recentTransactions: {
            rtId: string;
            id: string;
            createdAt: Date;
            nominal: import("@prisma/client/runtime/library").Decimal;
            saldoBerjalan: import("@prisma/client/runtime/library").Decimal;
            createdById: string;
            tipe: import(".prisma/client").$Enums.TipeKas;
            kategori: string;
            keterangan: string;
            buktiNotaUrl: string | null;
        }[];
    }>;
    createKasEntry(rtId: string, userId: string, data: {
        tipe: TipeKas;
        kategori: string;
        nominal: number;
        keterangan: string;
        buktiNotaUrl?: string;
    }): Promise<{
        rtId: string;
        id: string;
        createdAt: Date;
        nominal: import("@prisma/client/runtime/library").Decimal;
        saldoBerjalan: import("@prisma/client/runtime/library").Decimal;
        createdById: string;
        tipe: import(".prisma/client").$Enums.TipeKas;
        kategori: string;
        keterangan: string;
        buktiNotaUrl: string | null;
    }>;
    private static withdrawalRequests;
    private static platformFeeConfig;
    getPlatformFeeConfig(): {
        feeTransaksiIuran: number;
        feePenarikanKas: number;
        feeVirtualAccount: number;
        biayaAddonBulanan: number;
        updatedAt: string;
    };
    updatePlatformFeeConfig(data: {
        feeTransaksiIuran?: number;
        feePenarikanKas?: number;
        feeVirtualAccount?: number;
        biayaAddonBulanan?: number;
    }): {
        message: string;
        config: {
            feeTransaksiIuran: number;
            feePenarikanKas: number;
            feeVirtualAccount: number;
            biayaAddonBulanan: number;
            updatedAt: string;
        };
    };
    private static getStoragePath;
    static loadFromDisk(): void;
    static saveToDisk(): void;
    ajukanPenarikanKas(rtId: string, userId: string, data: {
        bankName: string;
        nomorRekening: string;
        namaPemilik: string;
        nominalTarik: number;
    }): Promise<{
        message: string;
        penarikan: {
            id: string;
            rtId: string;
            rtNomor: string;
            rwNomor: string;
            kelurahan: string;
            requestedById: string;
            requestedByName: string;
            bankName: string;
            nomorRekening: string;
            namaPemilik: string;
            nominalTarik: number;
            biayaAdmin: number;
            totalDipotong: number;
            saldoKasSaatPengajuan: number;
            status: "MENUNGGU_APPROVAL";
            createdAt: string;
        };
    }>;
    getRiwayatPenarikan(rtId: string): Promise<{
        id: string;
        rtId: string;
        rtNomor: string;
        rwNomor: string;
        kelurahan: string;
        requestedById: string;
        requestedByName: string;
        bankName: string;
        nomorRekening: string;
        namaPemilik: string;
        nominalTarik: number;
        biayaAdmin: number;
        totalDipotong: number;
        saldoKasSaatPengajuan: number;
        status: "MENUNGGU_APPROVAL" | "APPROVED" | "REJECTED";
        catatanApproval?: string;
        createdAt: string;
        approvedAt?: string;
    }[]>;
    getAllPenarikanSuperadmin(): Promise<{
        auditChecks: {
            saldoKasSaatIni: number;
            isSaldoCukup: boolean;
            isPgSufficient: boolean;
            estimasiSaldoPg: number;
            validitasSumberDana: string;
            isNamaCocok: boolean;
            kesimpulanAudit: string;
        };
        id: string;
        rtId: string;
        rtNomor: string;
        rwNomor: string;
        kelurahan: string;
        requestedById: string;
        requestedByName: string;
        bankName: string;
        nomorRekening: string;
        namaPemilik: string;
        nominalTarik: number;
        biayaAdmin: number;
        totalDipotong: number;
        saldoKasSaatPengajuan: number;
        status: "MENUNGGU_APPROVAL" | "APPROVED" | "REJECTED";
        catatanApproval?: string;
        createdAt: string;
        approvedAt?: string;
    }[]>;
    approvePenarikan(penarikanId: string, adminUserId: string): Promise<{
        message: string;
        penarikan: {
            id: string;
            rtId: string;
            rtNomor: string;
            rwNomor: string;
            kelurahan: string;
            requestedById: string;
            requestedByName: string;
            bankName: string;
            nomorRekening: string;
            namaPemilik: string;
            nominalTarik: number;
            biayaAdmin: number;
            totalDipotong: number;
            saldoKasSaatPengajuan: number;
            status: "MENUNGGU_APPROVAL" | "APPROVED" | "REJECTED";
            catatanApproval?: string;
            createdAt: string;
            approvedAt?: string;
        };
    }>;
    rejectPenarikan(penarikanId: string, alasan?: string): Promise<{
        message: string;
        penarikan: {
            id: string;
            rtId: string;
            rtNomor: string;
            rwNomor: string;
            kelurahan: string;
            requestedById: string;
            requestedByName: string;
            bankName: string;
            nomorRekening: string;
            namaPemilik: string;
            nominalTarik: number;
            biayaAdmin: number;
            totalDipotong: number;
            saldoKasSaatPengajuan: number;
            status: "MENUNGGU_APPROVAL" | "APPROVED" | "REJECTED";
            catatanApproval?: string;
            createdAt: string;
            approvedAt?: string;
        };
    }>;
    getSuperadminUangMasuk(): Promise<{
        summary: {
            totalBruto: number;
            totalHakKasRt: number;
            totalCuanPlatform: number;
            totalFeeBankVa: number;
            totalTransaksi: number;
        };
        transactions: {
            id: string;
            waktu: string;
            wilayah: string;
            tipe: string;
            pembayar: string;
            metode: string;
            nominalPokok: number;
            feePlatform: number;
            feeBankVa: number;
            totalBayar: number;
            status: string;
        }[];
    }>;
}
