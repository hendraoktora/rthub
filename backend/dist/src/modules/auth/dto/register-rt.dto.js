"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRtDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RegisterRtDto {
}
exports.RegisterRtDto = RegisterRtDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bpk. Hendra Gunawan', description: 'Nama lengkap Ketua / Admin RT' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "namaLengkap", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3276010101800001', description: '16 digit NIK KTP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "nik", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '081234567890', description: 'Nomor WhatsApp aktif' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'rt03@rthub.id', description: 'Email opsional' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!', description: 'Kata sandi akun RT' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '03', description: 'Nomor RT (e.g. 01, 03)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "nomorRt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '05', description: 'Nomor RW (e.g. 01, 05)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "nomorRw", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sukamaju', description: 'Nama Kelurahan / Desa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "namaKelurahan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Cilodong', description: 'Kecamatan' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "kecamatan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Depok', description: 'Kota / Kabupaten' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "kota", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jl. Melati Raya Blok C', description: 'Nama Jalan / Gang Utama RT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "namaJalan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL / Base64 Foto Dokumen SK Pengangkatan / Legalitas RT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRtDto.prototype, "skDokumenUrl", void 0);
//# sourceMappingURL=register-rt.dto.js.map