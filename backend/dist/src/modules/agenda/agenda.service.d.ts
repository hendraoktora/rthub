import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';
export declare class AgendaService {
    private prisma;
    constructor(prisma: PrismaService);
    getAgenda(user: any): Promise<{
        rtId: string | null;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string | null;
        kategori: string;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
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
        rtId: string | null;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string | null;
        kategori: string;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
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
        rtId: string | null;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string | null;
        kategori: string;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        tanggalMulai: Date;
        tanggalSelesai: Date | null;
        lokasi: string | null;
    }>;
    deleteAgenda(id: string, user: any): Promise<{
        rtId: string | null;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deskripsi: string | null;
        kategori: string;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        tanggalMulai: Date;
        tanggalSelesai: Date | null;
        lokasi: string | null;
    }>;
}
