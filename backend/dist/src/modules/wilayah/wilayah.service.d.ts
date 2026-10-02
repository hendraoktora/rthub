import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { AddonsService } from '../addons/addons.service';
export declare class WilayahService {
    private prisma;
    private addonsService;
    constructor(prisma: PrismaService, addonsService: AddonsService);
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
                masterTagihanId: string;
                rumahId: string;
                periodeBulan: number;
                periodeTahun: number;
                nominalPokok: import("@prisma/client/runtime/library").Decimal;
                adminFee: import("@prisma/client/runtime/library").Decimal;
                totalBayar: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.StatusTagihan;
                jatuhTempo: Date;
                paidAt: Date | null;
            }[];
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
                userId: string;
                namaLengkap: string;
                nik: string | null;
                noKk: string | null;
                noRumah: string | null;
                avatarUrl: string | null;
                skDokumenUrl: string | null;
                dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
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
    addWargaToRt(rtId: string, data: {
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
                userId: string;
                namaLengkap: string;
                nik: string | null;
                noKk: string | null;
                noRumah: string | null;
                avatarUrl: string | null;
                skDokumenUrl: string | null;
                dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
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
            userId: string;
            namaLengkap: string;
            nik: string | null;
            noKk: string | null;
            noRumah: string | null;
            avatarUrl: string | null;
            skDokumenUrl: string | null;
            dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
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
    addOrUpdatePengurus(rtId: string, data: {
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
            userId: string;
            namaLengkap: string;
            nik: string | null;
            noKk: string | null;
            noRumah: string | null;
            avatarUrl: string | null;
            skDokumenUrl: string | null;
            dataKeluarga: import("@prisma/client/runtime/library").JsonValue | null;
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
    getRtRekening(rtId: string): Promise<{
        id: string;
        nomor: string;
        namaBank: string;
        nomorRekening: string;
        atasNamaRekening: string;
        qrisImageUrl: string;
    }>;
    updateRtRekening(rtId: string, data: {
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
