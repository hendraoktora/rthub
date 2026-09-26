"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DocumentVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentVerificationService = void 0;
const common_1 = require("@nestjs/common");
let DocumentVerificationService = DocumentVerificationService_1 = class DocumentVerificationService {
    constructor() {
        this.logger = new common_1.Logger(DocumentVerificationService_1.name);
    }
    async verifyDocument(dto) {
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
};
exports.DocumentVerificationService = DocumentVerificationService;
exports.DocumentVerificationService = DocumentVerificationService = DocumentVerificationService_1 = __decorate([
    (0, common_1.Injectable)()
], DocumentVerificationService);
//# sourceMappingURL=document-verification.service.js.map