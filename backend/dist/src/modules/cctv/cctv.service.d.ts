import { PrismaService } from '../../prisma/prisma.service';
export declare class CctvService {
    private prisma;
    constructor(prisma: PrismaService);
    getCctvList(user: any): Promise<{
        rtId: string | null;
        id: string;
        isActive: boolean;
        rwId: string | null;
        createdAt: Date;
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl: string | null;
    }[]>;
    createCctv(user: any, data: {
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl?: string;
    }): Promise<{
        rtId: string | null;
        id: string;
        isActive: boolean;
        rwId: string | null;
        createdAt: Date;
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl: string | null;
    }>;
    deleteCctv(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
