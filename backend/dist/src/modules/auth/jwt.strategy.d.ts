import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        rw: {
            id: string;
            nomor: string;
            createdAt: Date;
            updatedAt: Date;
            kelurahanId: string;
        };
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
    } & {
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
}
export {};
