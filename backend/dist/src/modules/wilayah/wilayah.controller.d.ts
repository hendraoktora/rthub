import { WilayahService } from './wilayah.service';
import { Role } from '@prisma/client';
export declare class WilayahController {
    private readonly wilayahService;
    constructor(wilayahService: WilayahService);
    getKelurahanList(): Promise<({
        _count: {
            rws: number;
        };
    } & {
        kecamatan: string | null;
        kota: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nama: string;
        provinsi: string | null;
        kodePos: string | null;
    })[]>;
    getRwByKelurahan(kelurahanId: string): Promise<({
        _count: {
            rts: number;
        };
    } & {
        id: string;
        kelurahanId: string;
        createdAt: Date;
        updatedAt: Date;
        nomor: string;
    })[]>;
    getRtByRw(rwId: string): Promise<({
        _count: {
            rumah: number;
            users: number;
        };
    } & {
        namaJalan: string | null;
        skDokumenUrl: string | null;
        id: string;
        rwId: string;
        createdAt: Date;
        updatedAt: Date;
        nomor: string;
    })[]>;
    getAllRtSummary(): Promise<{
        id: string;
        nomor: string;
        namaJalan: string;
        rwNomor: string;
        kelurahanNama: string;
        kota: string;
        label: string;
        wargaCount: number;
        rumahCount: number;
        ketua: string;
        phone: string;
        saldoKas: number;
        createdAt: Date;
    }[]>;
    getWargaByRt(rtId: string): Promise<{
        totalRumah: number;
        totalWarga: number;
        rumahList: ({
            kartuKeluarga: ({
                anggota: {
                    nik: string | null;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nama: string;
                    hubungan: string;
                    noHp: string | null;
                    kkId: string;
                }[];
            } & {
                noKk: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                rumahId: string;
                namaKepala: string;
                fotoKkUrl: string | null;
            })[];
            tagihanWarga: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.StatusTagihan;
                masterTagihanId: string;
                rumahId: string;
                periodeBulan: number;
                periodeTahun: number;
                nominalPokok: import("@prisma/client/runtime/library").Decimal;
                adminFee: import("@prisma/client/runtime/library").Decimal;
                totalBayar: import("@prisma/client/runtime/library").Decimal;
                jatuhTempo: Date;
                paidAt: Date | null;
            }[];
        } & {
            rtId: string;
            noRumah: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            alamatLengkap: string | null;
            statusHunian: string | null;
        })[];
        userList: {
            profile: {
                namaLengkap: string;
                nik: string | null;
                skDokumenUrl: string | null;
                noRumah: string | null;
                noKk: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                avatarUrl: string | null;
            };
            phone: string;
            email: string | null;
            rtId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            kelurahanId: string | null;
            rwId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    addWargaToRt(rtId: string, body: {
        namaLengkap: string;
        phone: string;
        noRumah: string;
        nik?: string;
        noKk?: string;
        statusHunian?: string;
        namaIstri?: string;
        anggotaKeluarga?: string[];
    }): Promise<{
        message: string;
        user: {
            profile: {
                namaLengkap: string;
                nik: string | null;
                skDokumenUrl: string | null;
                noRumah: string | null;
                noKk: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                avatarUrl: string | null;
            };
            phone: string;
            email: string | null;
            rtId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            kelurahanId: string | null;
            rwId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        rumah: {
            rtId: string;
            noRumah: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            alamatLengkap: string | null;
            statusHunian: string | null;
        };
    }>;
    getPengurusByRt(rtId: string): Promise<{
        jabatan: string;
        nama: string;
        noRumah: string;
        profile: {
            namaLengkap: string;
            nik: string | null;
            skDokumenUrl: string | null;
            noRumah: string | null;
            noKk: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            avatarUrl: string | null;
        };
        phone: string;
        email: string | null;
        rtId: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    addOrUpdatePengurus(rtId: string, body: {
        namaLengkap: string;
        phone: string;
        role: Role;
        noRumah?: string;
        email?: string;
    }): Promise<{
        profile: {
            namaLengkap: string;
            nik: string | null;
            skDokumenUrl: string | null;
            noRumah: string | null;
            noKk: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            avatarUrl: string | null;
        };
        phone: string;
        email: string | null;
        rtId: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deletePengurus(userId: string): Promise<{
        phone: string;
        email: string | null;
        rtId: string | null;
        id: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
