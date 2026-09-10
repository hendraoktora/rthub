import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';
export declare class BeritaService {
    private prisma;
    constructor(prisma: PrismaService);
    getFeed(user: any): Promise<({
        author: {
            role: import(".prisma/client").$Enums.Role;
            profile: {
                namaLengkap: string;
            };
        };
    } & {
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
        authorId: string;
    })[]>;
    createBerita(user: any, data: {
        judul: string;
        konten: string;
        scope: ScopeWilayah;
        coverUrl?: string;
        isPinned?: boolean;
    }): Promise<{
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
        authorId: string;
    }>;
    updateBerita(id: string, user: any, data: {
        judul?: string;
        konten?: string;
        scope?: ScopeWilayah;
        coverUrl?: string;
        isPinned?: boolean;
    }): Promise<{
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
        authorId: string;
    }>;
    deleteBerita(id: string, user: any): Promise<{
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        judul: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
        authorId: string;
    }>;
}
