import { KasService } from './kas.service';
import { TipeKas } from '@prisma/client';
export declare class KasController {
    private readonly kasService;
    constructor(kasService: KasService);
    getSummary(user: any): Promise<{
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
    createKas(user: any, body: {
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
    createKasAlias(user: any, body: {
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
    getRiwayatPenarikan(user: any): Promise<{
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
    ajukanPenarikan(user: any, body: {
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
    getPenarikanSuperadmin(): Promise<{
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
    approvePenarikan(user: any, body: {
        penarikanId: string;
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
            status: "MENUNGGU_APPROVAL" | "APPROVED" | "REJECTED";
            catatanApproval?: string;
            createdAt: string;
            approvedAt?: string;
        };
    }>;
    rejectPenarikan(body: {
        penarikanId: string;
        alasan?: string;
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
    getFeeConfig(): Promise<{
        feeTransaksiIuran: number;
        feePenarikanKas: number;
        feeVirtualAccount: number;
        biayaAddonBulanan: number;
        updatedAt: string;
    }>;
    updateFeeConfig(body: {
        feeTransaksiIuran?: number;
        feePenarikanKas?: number;
        feeVirtualAccount?: number;
        biayaAddonBulanan?: number;
    }): Promise<{
        message: string;
        config: {
            feeTransaksiIuran: number;
            feePenarikanKas: number;
            feeVirtualAccount: number;
            biayaAddonBulanan: number;
            updatedAt: string;
        };
    }>;
}
