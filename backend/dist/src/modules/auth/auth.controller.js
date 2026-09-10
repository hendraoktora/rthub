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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const otp_service_1 = require("./otp.service");
const document_verification_service_1 = require("./document-verification.service");
const register_rt_dto_1 = require("./dto/register-rt.dto");
const register_warga_dto_1 = require("./dto/register-warga.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthController = class AuthController {
    constructor(authService, otpService, documentVerificationService) {
        this.authService = authService;
        this.otpService = otpService;
        this.documentVerificationService = documentVerificationService;
    }
    async sendOtp(body) {
        return this.otpService.sendOtp(body.target, body.channel, body.purpose);
    }
    async verifyOtp(body) {
        const isValid = await this.otpService.verifyOtp(body.target, body.code);
        return { success: isValid, message: 'Kode OTP valid dan terverifikasi.' };
    }
    async verifyDocument(body) {
        return this.documentVerificationService.verifyDocument(body);
    }
    async registerRT(dto) {
        return this.authService.registerRT(dto);
    }
    async registerWarga(dto) {
        return this.authService.registerWarga(dto);
    }
    async listPublicRt() {
        return this.authService.listPublicRt();
    }
    async checkNik(nik) {
        return this.authService.checkNikAvailable(nik);
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    async getProfile(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
    async updateProfile(user, dto) {
        return this.authService.updateProfile(user.id, dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('send-otp'),
    (0, swagger_1.ApiOperation)({
        summary: 'Kirim Kode OTP (WhatsApp / Email)',
        description: 'Mengirimkan kode OTP 6 digit untuk verifikasi pendaftaran akun.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verifikasi Kode OTP',
        description: 'Memverifikasi kode OTP yang dimasukkan pengguna.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('verify-document'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verifikasi Forensik AI & Validasi Data Dokumen SK RT',
        description: 'Memeriksa keaslian dokumen SK RT dari generator AI/manipulasi dan mencocokkan data NIK, Nama, dan Wilayah.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Post)('register-rt'),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrasi Mandiri RT (Bottom-Up Auto Grouping)',
        description: 'Ketua/Admin RT mendaftarkan RT baru. RW & Kelurahan otomatis digabungkan jika sudah pernah didaftarkan oleh RT lain.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'RT dan Akun Admin berhasil dibuat.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_rt_dto_1.RegisterRtDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerRT", null);
__decorate([
    (0, common_1.Post)('register-warga'),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrasi Akun Warga',
        description: 'Warga mendaftar dengan memilih RT tempat tinggal.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Akun Warga berhasil dibuat.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_warga_dto_1.RegisterWargaDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerWarga", null);
__decorate([
    (0, common_1.Get)('list-rt'),
    (0, swagger_1.ApiOperation)({
        summary: 'Daftar Semua RT Terdaftar (Publik untuk Pendaftaran Warga)',
        description: 'Menampilkan daftar RT beserta RW dan Kelurahan untuk dipilih calon warga baru.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Daftar RT berhasil diambil.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listPublicRt", null);
__decorate([
    (0, common_1.Get)('check-nik/:nik'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cek Ketersediaan NIK (Anti Duplikasi)',
        description: 'Memeriksa apakah NIK sudah digunakan oleh akun lain di sistem.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status ketersediaan NIK.' }),
    __param(0, (0, common_1.Param)('nik')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkNik", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'Login Warga / Pengurus RT / RW / Superadmin',
        description: 'Login menggunakan nomor WhatsApp/Email dan kata sandi untuk mendapatkan JWT Token.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login berhasil.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan profil pengguna saat ini' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update profil pengguna dan foto profil' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth (Autentikasi, Registrasi, Dokumen AI & OTP)'),
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        otp_service_1.OtpService,
        document_verification_service_1.DocumentVerificationService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map