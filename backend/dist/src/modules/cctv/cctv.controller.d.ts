import { CctvService } from './cctv.service';
export declare class CctvController {
    private readonly cctvService;
    constructor(cctvService: CctvService);
    getCctvList(user: any): Promise<{
        id: string;
        isActive: boolean;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl: string | null;
    }[]>;
    createCctv(user: any, body: {
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        rwId: string | null;
        rtId: string | null;
        createdAt: Date;
        namaTitik: string;
        streamUrl: string;
        thumbnailUrl: string | null;
    }>;
    deleteCctv(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
