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
}
