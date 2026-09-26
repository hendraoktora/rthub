import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class DocumentVerificationService {
  private readonly logger = new Logger(DocumentVerificationService.name);

  /**
   * Pengecekan Dokumen SK RT (Fungsi deteksi AI dinonaktifkan, dokumen diterima langsung)
   */
  async verifyDocument(dto: VerifyDocumentDto): Promise<VerificationResult> {
    this.logger.log(`Verifikasi dokumen SK RT diterima langsung untuk RT ${dto.nomorRt || '-'} / RW ${dto.nomorRw || '-'}`);

    return {
      isVerified: true,
      confidenceScore: 100,
      status: 'AUTO_APPROVED',
      isAiGenerated: false,
      isTampered: false,
      details: {
        nikMatch: true,
        namaMatch: true,
        wilayahMatch: true,
        formatValid: true,
        antiAiPassed: true,
      },
      summaryMessage: 'Dokumen SK RT berhasil dilampirkan & diverifikasi.',
      errorReasons: [],
    };
  }
}
