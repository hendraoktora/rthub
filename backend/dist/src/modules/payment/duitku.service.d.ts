import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AddonsService } from '../addons/addons.service';
import { LapakService } from '../lapak/lapak.service';
export interface CreateInvoiceDto {
    tagihanId: string;
    paymentMethodCode?: string;
}
export declare class DuitkuService {
    private readonly config;
    private readonly prisma;
    private readonly addonsService;
    private readonly lapakService;
    private readonly logger;
    private readonly merchantCode;
    private readonly apiKey;
    private readonly env;
    private readonly callbackUrl;
    private readonly returnUrl;
    constructor(config: ConfigService, prisma: PrismaService, addonsService: AddonsService, lapakService: LapakService);
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
    private readonly defaultSandboxMerchantCode;
    private readonly defaultSandboxApiKey;
    private readonly defaultSandboxBaseUrl;
    private executeDuitkuInquiry;
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
    createSubscriptionCheckout(dto: {
        rtId?: string;
        planName?: string;
        amount?: number;
        rtName?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        paymentMethodCode?: string;
    }): Promise<{
        success: boolean;
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
    createAdsCheckout(dto: {
        lapakId?: string;
        productTitle?: string;
        durasiHari?: number;
        amount?: number;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        paymentMethodCode?: string;
    }): Promise<{
        success: boolean;
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
