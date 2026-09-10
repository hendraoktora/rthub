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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nama: string;
        kecamatan: string | null;
        kota: string | null;
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
            users: number;
            rumah: number;
        };
    } & {
        id: string;
        rwId: string;
        createdAt: Date;
        updatedAt: Date;
        skDokumenUrl: string | null;
        nomor: string;
        namaJalan: string | null;
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
            tagihanWarga: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                nominalPokok: import("@prisma/client/runtime/library").Decimal;
                adminFee: import("@prisma/client/runtime/library").Decimal;
                rumahId: string;
                masterTagihanId: string;
                periodeBulan: number;
                periodeTahun: number;
                totalBayar: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.StatusTagihan;
                jatuhTempo: Date;
                paidAt: Date | null;
            }[];
            kartuKeluarga: ({
                anggota: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nik: string | null;
                    nama: string;
                    hubungan: string;
                    noHp: string | null;
                    kkId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                noKk: string;
                rumahId: string;
                namaKepala: string;
                fotoKkUrl: string | null;
            })[];
        } & {
            id: string;
            rtId: string;
            createdAt: Date;
            updatedAt: Date;
            noRumah: string;
            alamatLengkap: string | null;
            statusHunian: string | null;
        })[];
        userList: {
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                namaLengkap: string;
                nik: string | null;
                noKk: string | null;
                noRumah: string | null;
                avatarUrl: string | null;
                skDokumenUrl: string | null;
                userId: string;
            };
            id: string;
            phone: string;
            email: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            kelurahanId: string | null;
            rwId: string | null;
            rtId: string | null;
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
                id: string;
                createdAt: Date;
                updatedAt: Date;
                namaLengkap: string;
                nik: string | null;
                noKk: string | null;
                noRumah: string | null;
                avatarUrl: string | null;
                skDokumenUrl: string | null;
                userId: string;
            };
            id: string;
            phone: string;
            email: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            kelurahanId: string | null;
            rwId: string | null;
            rtId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        rumah: {
            id: string;
            rtId: string;
            createdAt: Date;
            updatedAt: Date;
            noRumah: string;
            alamatLengkap: string | null;
            statusHunian: string | null;
        };
    }>;
    getPengurusByRt(rtId: string): Promise<{
        jabatan: string;
        nama: string;
        noRumah: string;
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            namaLengkap: string;
            nik: string | null;
            noKk: string | null;
            noRumah: string | null;
            avatarUrl: string | null;
            skDokumenUrl: string | null;
            userId: string;
        };
        id: string;
        phone: string;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            namaLengkap: string;
            nik: string | null;
            noKk: string | null;
            noRumah: string | null;
            avatarUrl: string | null;
            skDokumenUrl: string | null;
            userId: string;
        };
        id: string;
        phone: string;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deletePengurus(userId: string): Promise<{
        id: string;
        phone: string;
        email: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
