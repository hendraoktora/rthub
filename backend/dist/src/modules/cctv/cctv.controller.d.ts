import { CctvService } from './cctv.service';
export declare class CctvController {
    private readonly cctvService;
    constructor(cctvService: CctvService);
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
    createCctv(user: any, body: {
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
