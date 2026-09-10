import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: string;
        phone: string;
        role: string;
    }): Promise<{
        kelurahan: {
            kecamatan: string | null;
            kota: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nama: string;
            provinsi: string | null;
            kodePos: string | null;
        };
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
        rw: {
            id: string;
            kelurahanId: string;
            createdAt: Date;
            updatedAt: Date;
            nomor: string;
        };
        rt: {
            namaJalan: string | null;
            skDokumenUrl: string | null;
            id: string;
            rwId: string;
            createdAt: Date;
            updatedAt: Date;
            nomor: string;
        };
    } & {
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
export {};
