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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nama: string;
            kecamatan: string | null;
            kota: string | null;
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
            nomor: string;
            namaJalan: string | null;
        };
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
