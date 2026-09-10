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
exports.RegisterWargaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RegisterWargaDto {
}
exports.RegisterWargaDto = RegisterWargaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bpk. Budi Santoso', description: 'Nama lengkap warga' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterWargaDto.prototype, "namaLengkap", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '089876543210', description: 'Nomor WhatsApp aktif' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterWargaDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'budi@gmail.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterWargaDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!', description: 'Kata sandi akun' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterWargaDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'rt-uuid-string', description: 'ID RT tempat tinggal' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterWargaDto.prototype, "rtId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Blok C3 No. 12', description: 'Nomor rumah / blok' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterWargaDto.prototype, "noRumah", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3276012345678901', description: 'Nomor KK' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterWargaDto.prototype, "noKk", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3276011111111111', description: 'NIK' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterWargaDto.prototype, "nik", void 0);
//# sourceMappingURL=register-warga.dto.js.map