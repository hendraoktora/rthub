import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { DocumentVerificationService } from './document-verification.service';
import { RegisterRtDto } from './dto/register-rt.dto';
import { RegisterWargaDto } from './dto/register-warga.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    private readonly otpService;
    private readonly documentVerificationService;
    constructor(authService: AuthService, otpService: OtpService, documentVerificationService: DocumentVerificationService);
    sendOtp(body: {
        target: string;
        channel?: 'WHATSAPP' | 'EMAIL';
        purpose?: string;
    }): Promise<{
        success: boolean;
        message: string;
        targetMasked: string;
        channel: "WHATSAPP" | "EMAIL";
        expiresInSeconds: number;
        demoOtp: string;
    }>;
    verifyOtp(body: {
        target: string;
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyDocument(body: {
        documentBase64: string;
        nik: string;
        namaLengkap: string;
        nomorRt: string;
        nomorRw: string;
        namaKelurahan: string;
    }): Promise<import("./document-verification.service").VerificationResult>;
    registerRT(dto: RegisterRtDto): Promise<{
        message: string;
        autoGrouped: {
            kelurahan: string;
            rw: string;
            rt: string;
            isExistingRw: boolean;
        };
        user: any;
        accessToken: string;
    }>;
    registerWarga(dto: RegisterWargaDto): Promise<{
        message: string;
        user: any;
        accessToken: string;
    }>;
    listPublicRt(): Promise<{
        id: string;
        nomorRt: string;
        nomorRw: string;
        namaKelurahan: string;
        kecamatan: string;
        kota: string;
        namaJalan: string;
        label: string;
    }[]>;
    checkNik(nik: string): Promise<{
        available: boolean;
        valid: boolean;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        user: any;
        accessToken: string;
    }>;
    getProfile(user: any): Promise<any>;
    updateProfile(user: any, dto: {
        namaLengkap?: string;
        phone?: string;
        email?: string;
        noRumah?: string;
        nik?: string;
        noKk?: string;
        avatarUrl?: string;
    }): Promise<{
        message: string;
        user: any;
    }>;
}
