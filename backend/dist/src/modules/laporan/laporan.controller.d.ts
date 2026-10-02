import { LaporanService } from './laporan.service';
import { StatusLaporan } from '@prisma/client';
export declare class LaporanController {
    private readonly laporanService;
    constructor(laporanService: LaporanService);
    createLaporan(user: any, body: {
        judul: string;
        deskripsi: string;
        kategori?: string;
        fotoUrl?: string;
        isAnonymous?: boolean;
        tujuan?: string;
        tipeLaporan?: string;
        dataSurat?: any;
    }): Promise<{
        user: {
            id: string;
            phone: string;
            profile: {
                namaLengkap: string;
                nik: string;
                noRumah: string;
            };
        };
    } & {
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        deskripsi: string;
        judul: string;
        kategori: string;
        fotoUrl: string | null;
        isAnonymous: boolean;
        tujuan: string;
        tipeLaporan: string;
        dataSurat: string | null;
        nomorSurat: string | null;
        tanggapanRT: string | null;
        tanggapanBy: string | null;
        respondedAt: Date | null;
    }>;
    getLaporanList(user: any): Promise<({
        user: {
            id: string;
            phone: string;
            profile: {
                namaLengkap: string;
                nik: string;
                noRumah: string;
            };
        };
        rt: {
            id: string;
            rwId: string;
            createdAt: Date;
            updatedAt: Date;
            skDokumenUrl: string | null;
            namaJalan: string | null;
            nomor: string;
            namaBank: string | null;
            nomorRekening: string | null;
            atasNamaRekening: string | null;
            qrisImageUrl: string | null;
        };
    } & {
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        deskripsi: string;
        judul: string;
        kategori: string;
        fotoUrl: string | null;
        isAnonymous: boolean;
        tujuan: string;
        tipeLaporan: string;
        dataSurat: string | null;
        nomorSurat: string | null;
        tanggapanRT: string | null;
        tanggapanBy: string | null;
        respondedAt: Date | null;
    })[]>;
    updateStatus(user: any, id: string, body: {
        status: StatusLaporan;
        tanggapanRT?: string;
        tanggapanBy?: string;
        nomorSurat?: string;
    }): Promise<{
        user: {
            id: string;
            phone: string;
            profile: {
                namaLengkap: string;
                nik: string;
                noRumah: string;
            };
        };
        rt: {
            id: string;
            rwId: string;
            createdAt: Date;
            updatedAt: Date;
            skDokumenUrl: string | null;
            namaJalan: string | null;
            nomor: string;
            namaBank: string | null;
            nomorRekening: string | null;
            atasNamaRekening: string | null;
            qrisImageUrl: string | null;
        };
    } & {
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        deskripsi: string;
        judul: string;
        kategori: string;
        fotoUrl: string | null;
        isAnonymous: boolean;
        tujuan: string;
        tipeLaporan: string;
        dataSurat: string | null;
        nomorSurat: string | null;
        tanggapanRT: string | null;
        tanggapanBy: string | null;
        respondedAt: Date | null;
    }>;
}
