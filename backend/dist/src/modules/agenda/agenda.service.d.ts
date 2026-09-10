import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';
export declare class AgendaService {
    private prisma;
    constructor(prisma: PrismaService);
    getAgenda(user: any): Promise<{
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string | null;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        kategori: string;
        tanggalMulai: Date;
        tanggalSelesai: Date | null;
        lokasi: string | null;
    }[]>;
    createAgenda(user: any, data: {
        judul: string;
        kategori: string;
        deskripsi?: string;
        tanggalMulai: string;
        tanggalSelesai?: string;
        lokasi?: string;
        scope?: ScopeWilayah;
    }): Promise<{
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string | null;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        kategori: string;
        tanggalMulai: Date;
        tanggalSelesai: Date | null;
        lokasi: string | null;
    }>;
    updateAgenda(id: string, user: any, data: {
        judul?: string;
        kategori?: string;
        deskripsi?: string;
        tanggalMulai?: string;
        tanggalSelesai?: string;
        lokasi?: string;
    }): Promise<{
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string | null;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        kategori: string;
        tanggalMulai: Date;
        tanggalSelesai: Date | null;
        lokasi: string | null;
    }>;
    deleteAgenda(id: string, user: any): Promise<{
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string | null;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        kategori: string;
        tanggalMulai: Date;
        tanggalSelesai: Date | null;
        lokasi: string | null;
    }>;
}
