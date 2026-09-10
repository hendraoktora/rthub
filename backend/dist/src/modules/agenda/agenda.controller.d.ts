import { AgendaService } from './agenda.service';
import { ScopeWilayah } from '@prisma/client';
export declare class AgendaController {
    private readonly agendaService;
    constructor(agendaService: AgendaService);
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
    createAgenda(user: any, body: {
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
    updateAgenda(id: string, user: any, body: {
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
