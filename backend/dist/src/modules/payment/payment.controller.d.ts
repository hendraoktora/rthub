import { DuitkuService, CreateInvoiceDto } from './duitku.service';
export declare class PaymentController {
    private readonly duitkuService;
    constructor(duitkuService: DuitkuService);
    getGatewayInfo(): {
        provider: string;
        configured: boolean;
        environment: string;
        merchantCode: string;
        callbackUrl: string;
        returnUrl: string;
    };
    getChannels(): Promise<{
        code: string;
        name: string;
        category: string;
        icon: string;
        feeType: string;
        fee: string;
        desc: string;
    }[]>;
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
    handleDuitkuCallback(body: any): Promise<{
        status: string;
        message: string;
    }>;
    checkStatus(merchantOrderId: string): Promise<any>;
}
