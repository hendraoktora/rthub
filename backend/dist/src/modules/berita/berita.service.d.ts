import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';
export declare class BeritaService {
    private prisma;
    constructor(prisma: PrismaService);
    getFeed(user: any): Promise<({
        author: {
            profile: {
                namaLengkap: string;
            };
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        rtId: string | null;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        authorId: string;
        judul: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
    })[]>;
    createBerita(user: any, data: {
        judul: string;
        konten: string;
        scope: ScopeWilayah;
        coverUrl?: string;
        isPinned?: boolean;
    }): Promise<{
        rtId: string | null;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        authorId: string;
        judul: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
    }>;
    updateBerita(id: string, user: any, data: {
        judul?: string;
        konten?: string;
        scope?: ScopeWilayah;
        coverUrl?: string;
        isPinned?: boolean;
    }): Promise<{
        rtId: string | null;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        authorId: string;
        judul: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
    }>;
    deleteBerita(id: string, user: any): Promise<{
        rtId: string | null;
        id: string;
        kelurahanId: string | null;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        authorId: string;
        judul: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
    }>;
}
