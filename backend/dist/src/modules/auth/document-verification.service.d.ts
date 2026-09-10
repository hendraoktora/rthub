export interface VerifyDocumentDto {
    documentBase64: string;
    nik: string;
    namaLengkap: string;
    nomorRt: string;
    nomorRw: string;
    namaKelurahan: string;
}
export interface VerificationResult {
    isVerified: boolean;
    confidenceScore: number;
    status: 'AUTO_APPROVED' | 'REJECTED';
    isAiGenerated: boolean;
    isTampered: boolean;
    details: {
        nikMatch: boolean;
        namaMatch: boolean;
        wilayahMatch: boolean;
        formatValid: boolean;
        antiAiPassed: boolean;
    };
    summaryMessage: string;
    errorReasons: string[];
}
export declare class DocumentVerificationService {
    private readonly logger;
    verifyDocument(dto: VerifyDocumentDto): Promise<VerificationResult>;
}
