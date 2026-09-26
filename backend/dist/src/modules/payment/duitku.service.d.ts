import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export interface CreateInvoiceDto {
    tagihanId: string;
    paymentMethodCode?: string;
}
export declare class DuitkuService {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private readonly merchantCode;
    private readonly apiKey;
    private readonly env;
    private readonly callbackUrl;
    private readonly returnUrl;
    constructor(config: ConfigService, prisma: PrismaService);
    private get baseUrl();
    isConfigured(): boolean;
    getGatewayStatus(): {
        provider: string;
        configured: boolean;
        environment: string;
        merchantCode: string;
        callbackUrl: string;
        returnUrl: string;
    };
    createInvoice(userId: string, dto: CreateInvoiceDto): Promise<{
        success: boolean;
        isSimulation: boolean;
        merchantOrderId: string;
        reference: any;
        paymentUrl: any;
        vaNumber: any;
        qrString: any;
        amount: number;
        paymentMethod: string;
        statusCode: any;
        message: string;
    }>;
    handleCallback(body: any): Promise<{
        status: string;
        message: string;
    }>;
    checkTransactionStatus(merchantOrderId: string): Promise<any>;
    getPaymentChannels(): Promise<{
        code: string;
        name: string;
        category: string;
        icon: string;
        feeType: string;
        fee: string;
        desc: string;
    }[]>;
    createDisbursement(dto: {
        withdrawalId: string;
        bankCode: string;
        bankAccount: string;
        accountHolderName: string;
        amount: number;
        purpose: string;
    }): Promise<{
        success: boolean;
        isSimulation: boolean;
        disbursementRef: string;
        status: string;
        message: string;
        raw?: undefined;
    } | {
        success: boolean;
        disbursementRef: any;
        status: string;
        message: any;
        raw: any;
        isSimulation?: undefined;
    } | {
        success: boolean;
        isSimulation: boolean;
        status: string;
        message: string;
        disbursementRef?: undefined;
        raw?: undefined;
    }>;
}
