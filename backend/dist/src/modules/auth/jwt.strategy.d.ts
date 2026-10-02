import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        kelurahan: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            kecamatan: string | null;
            kota: string | null;
            nama: string;
            provinsi: string | null;
            kodePos: string | null;
        };
        rw: {
            id: string;
            kelurahanId: string;
            createdAt: Date;
            updatedAt: Date;
            nomor: string;
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
    } & {
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
export {};
