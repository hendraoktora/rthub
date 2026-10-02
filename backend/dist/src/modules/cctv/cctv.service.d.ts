import { PrismaService } from '../../prisma/prisma.service';
export declare class CctvService {
    private prisma;
    constructor(prisma: PrismaService);
    getCctvList(user: any): Promise<{
        id: string;
        rwId: string | null;
        createdAt: Date;
        rtId: string | null;
        isActive: boolean;
        kelurahanId: string | null;
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl: string | null;
    }[]>;
    createCctv(user: any, data: {
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl?: string;
    }): Promise<{
        id: string;
        rwId: string | null;
        createdAt: Date;
        rtId: string | null;
        isActive: boolean;
        kelurahanId: string | null;
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl: string | null;
    }>;
    deleteCctv(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
