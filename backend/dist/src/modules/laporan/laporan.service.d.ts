import { PrismaService } from '../../prisma/prisma.service';
import { StatusLaporan } from '@prisma/client';
import { AddonsService } from '../addons/addons.service';
export declare class LaporanService {
    private prisma;
    private addonsService;
    constructor(prisma: PrismaService, addonsService: AddonsService);
    createLaporan(user: any, data: {
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
            profile: {
                namaLengkap: string;
                nik: string;
                noRumah: string;
            };
            phone: string;
        };
    } & {
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string;
        kategori: string;
        kelurahanId: string | null;
        userId: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        judul: string;
        deskripsi: string;
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
        rt: {
            id: string;
            nomor: string;
            namaJalan: string | null;
            skDokumenUrl: string | null;
            rwId: string;
            createdAt: Date;
            updatedAt: Date;
            namaBank: string | null;
            nomorRekening: string | null;
            atasNamaRekening: string | null;
            qrisImageUrl: string | null;
        };
        user: {
            id: string;
            profile: {
                namaLengkap: string;
                nik: string;
                noRumah: string;
            };
            phone: string;
        };
    } & {
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string;
        kategori: string;
        kelurahanId: string | null;
        userId: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        judul: string;
        deskripsi: string;
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
    updateStatus(user: any, laporanId: string, data: {
        status: StatusLaporan;
        tanggapanRT?: string;
        tanggapanBy?: string;
        nomorSurat?: string;
    }): Promise<{
        rt: {
            id: string;
            nomor: string;
            namaJalan: string | null;
            skDokumenUrl: string | null;
            rwId: string;
            createdAt: Date;
            updatedAt: Date;
            namaBank: string | null;
            nomorRekening: string | null;
            atasNamaRekening: string | null;
            qrisImageUrl: string | null;
        };
        user: {
            id: string;
            profile: {
                namaLengkap: string;
                nik: string;
                noRumah: string;
            };
            phone: string;
        };
    } & {
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string;
        kategori: string;
        kelurahanId: string | null;
        userId: string;
        status: import(".prisma/client").$Enums.StatusLaporan;
        judul: string;
        deskripsi: string;
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
