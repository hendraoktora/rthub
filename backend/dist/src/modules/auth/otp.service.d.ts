export declare class OtpService {
    private readonly logger;
    private readonly otpStore;
    private mailTransporter;
    constructor();
    private initMailTransporter;
    sendOtp(target: string, channel?: 'WHATSAPP' | 'EMAIL', purpose?: string): Promise<{
        success: boolean;
        message: string;
        targetMasked: string;
        channel: "WHATSAPP" | "EMAIL";
        expiresInSeconds: number;
    }>;
    private sendEmailOtp;
    verifyOtp(target: string, code: string): Promise<boolean>;
    private maskTarget;
}
