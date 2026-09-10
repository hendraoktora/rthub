import { LaporanService } from './laporan.service';
import { StatusLaporan } from '@prisma/client';
export declare class LaporanController {
    private readonly laporanService;
    constructor(laporanService: LaporanService);
    createLaporan(user: any, body: {
        judul: string;
        deskripsi: string;
        kategori: string;
        fotoUrl?: string;
        isAnonymous?: boolean;
    }): Promise<{
        user: {
            profile: {
                namaLengkap: string;
                noRumah: string;
            };
        };
    } & {
        id: string;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deskripsi: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        judul: string;
        kategori: string;
        fotoUrl: string | null;
        isAnonymous: boolean;
        tanggapanRT: string | null;
    }>;
    getLaporanList(user: any): Promise<{
        id: string;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deskripsi: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        judul: string;
        kategori: string;
        fotoUrl: string | null;
        isAnonymous: boolean;
        tanggapanRT: string | null;
    }[]>;
    updateStatus(id: string, body: {
        status: StatusLaporan;
        tanggapanRT?: string;
    }): Promise<{
        id: string;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deskripsi: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        judul: string;
        kategori: string;
        fotoUrl: string | null;
        isAnonymous: boolean;
        tanggapanRT: string | null;
    }>;
}
