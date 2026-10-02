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
        kecamatan: string | null;
        kota: string | null;
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
        nomor: string;
        createdAt: Date;
        updatedAt: Date;
        kelurahanId: string;
    })[]>;
    getRtByRw(rwId: string): Promise<({
        _count: {
            users: number;
            rumah: number;
        };
    } & {
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
        totalSaldo: number;
        saldoActive: number;
        saldoCash: number;
        totalPemasukan: number;
        totalPengeluaran: number;
        totalPemasukanDigital: number;
        totalPemasukanTunai: number;
        createdAt: Date;
        paket: string;
        isPro: boolean;
        statusAddon: "AKTIF" | "TRIAL" | "TIDAK_AKTIF";
        expiredAt: string;
    }[]>;
    getWargaByRt(rtId: string): Promise<{
        totalRumah: number;
        totalWarga: number;
        rumahList: ({
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rtId: string;
            noRumah: string;
            alamatLengkap: string | null;
            statusHunian: string | null;
        })[];
        userList: {
            profile: {
                id: string;
                skDokumenUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
                namaLengkap: string;
                nik: string | null;
                noRumah: string | null;
                noKk: string | null;
                userId: string;
                avatarUrl: string | null;
                dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
            };
            id: string;
            rwId: string | null;
            createdAt: Date;
            updatedAt: Date;
            rtId: string | null;
            phone: string;
            email: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            kelurahanId: string | null;
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
                skDokumenUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
                namaLengkap: string;
                nik: string | null;
                noRumah: string | null;
                noKk: string | null;
                userId: string;
                avatarUrl: string | null;
                dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
            };
            id: string;
            rwId: string | null;
            createdAt: Date;
            updatedAt: Date;
            rtId: string | null;
            phone: string;
            email: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            kelurahanId: string | null;
        };
        rumah: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rtId: string;
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
            skDokumenUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            namaLengkap: string;
            nik: string | null;
            noRumah: string | null;
            noKk: string | null;
            userId: string;
            avatarUrl: string | null;
            dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
        };
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string | null;
        phone: string;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
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
            skDokumenUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            namaLengkap: string;
            nik: string | null;
            noRumah: string | null;
            noKk: string | null;
            userId: string;
            avatarUrl: string | null;
            dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
        };
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string | null;
        phone: string;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
    }>;
    deletePengurus(userId: string): Promise<{
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string | null;
        phone: string;
        email: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        kelurahanId: string | null;
    }>;
    getRtRekening(rtId: string): Promise<{
        id: string;
        nomor: string;
        namaBank: string;
        nomorRekening: string;
        atasNamaRekening: string;
        qrisImageUrl: string;
    }>;
    updateRtRekening(rtId: string, body: {
        namaBank?: string;
        nomorRekening?: string;
        atasNamaRekening?: string;
        qrisImageUrl?: string;
    }): Promise<{
        id: string;
        nomor: string;
        namaBank: string;
        nomorRekening: string;
        atasNamaRekening: string;
        qrisImageUrl: string;
    }>;
}
