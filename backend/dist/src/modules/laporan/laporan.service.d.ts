import { PrismaService } from '../../prisma/prisma.service';
import { StatusLaporan } from '@prisma/client';
export declare class LaporanService {
    private prisma;
    constructor(prisma: PrismaService);
    createLaporan(user: any, data: {
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
    updateStatus(laporanId: string, data: {
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
