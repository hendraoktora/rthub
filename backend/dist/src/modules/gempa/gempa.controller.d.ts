import { GempaService, GempaData } from './gempa.service';
export declare class GempaController {
    private readonly gempaService;
    constructor(gempaService: GempaService);
    getTerkini(): Promise<{
        status: string;
        data: GempaData;
    }>;
    broadcast(req: any, body: GempaData): Promise<{
        success: boolean;
        message: string;
        fcmResponse: string;
        gempa: GempaData;
    }>;
}
