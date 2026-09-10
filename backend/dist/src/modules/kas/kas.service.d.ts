import { PrismaService } from '../../prisma/prisma.service';
import { TipeKas } from '@prisma/client';
export declare class KasService {
    private prisma;
    constructor(prisma: PrismaService);
    getKasSummary(rtId: string): Promise<{
        saldoKas: number;
        totalPemasukan: number;
        totalPengeluaran: number;
        recentTransactions: {
            id: string;
            rtId: string;
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
        id: string;
        rtId: string;
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
