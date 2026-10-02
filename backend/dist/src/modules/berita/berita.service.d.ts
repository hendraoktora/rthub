import { PrismaService } from '../../prisma/prisma.service';
import { ScopeWilayah } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
export declare class BeritaService {
    private prisma;
    private notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    getFeed(user: any): Promise<({
        author: {
            profile: {
                namaLengkap: string;
            };
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string | null;
        kelurahanId: string | null;
        judul: string;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        authorId: string;
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
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string | null;
        kelurahanId: string | null;
        judul: string;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        authorId: string;
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
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string | null;
        kelurahanId: string | null;
        judul: string;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        authorId: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
    }>;
    deleteBerita(id: string, user: any): Promise<{
        id: string;
        rwId: string | null;
        createdAt: Date;
        updatedAt: Date;
        rtId: string | null;
        kelurahanId: string | null;
        judul: string;
        scope: import(".prisma/client").$Enums.ScopeWilayah;
        authorId: string;
        konten: string;
        coverUrl: string | null;
        isPinned: boolean;
    }>;
}
