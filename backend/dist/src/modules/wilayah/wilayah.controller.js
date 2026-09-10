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
exports.WilayahController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wilayah_service_1 = require("./wilayah.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let WilayahController = class WilayahController {
    constructor(wilayahService) {
        this.wilayahService = wilayahService;
    }
    async getKelurahanList() {
        return this.wilayahService.getKelurahanList();
    }
    async getRwByKelurahan(kelurahanId) {
        return this.wilayahService.getRwByKelurahan(kelurahanId);
    }
    async getRtByRw(rwId) {
        return this.wilayahService.getRtByRw(rwId);
    }
    async getAllRtSummary() {
        return this.wilayahService.getAllRtSummary();
    }
    async getWargaByRt(rtId) {
        return this.wilayahService.getWargaByRt(rtId);
    }
    async addWargaToRt(rtId, body) {
        return this.wilayahService.addWargaToRt(rtId, body);
    }
    async getPengurusByRt(rtId) {
        return this.wilayahService.getPengurusByRt(rtId);
    }
    async addOrUpdatePengurus(rtId, body) {
        return this.wilayahService.addOrUpdatePengurus(rtId, body);
    }
    async deletePengurus(userId) {
        return this.wilayahService.deletePengurus(userId);
    }
};
exports.WilayahController = WilayahController;
__decorate([
    (0, common_1.Get)('kelurahan'),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar semua Kelurahan terdaftar' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "getKelurahanList", null);
__decorate([
    (0, common_1.Get)('kelurahan/:kelurahanId/rw'),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar RW di bawah Kelurahan tertentu' }),
    __param(0, (0, common_1.Param)('kelurahanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "getRwByKelurahan", null);
__decorate([
    (0, common_1.Get)('rw/:rwId/rt'),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar RT di bawah RW tertentu' }),
    __param(0, (0, common_1.Param)('rwId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "getRtByRw", null);
__decorate([
    (0, common_1.Get)('rt-summary-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar ringkasan semua RT terdaftar (Superadmin real-time)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "getAllRtSummary", null);
__decorate([
    (0, common_1.Get)('rt/:rtId/warga'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar lengkap warga dan unit rumah per RT' }),
    __param(0, (0, common_1.Param)('rtId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "getWargaByRt", null);
__decorate([
    (0, common_1.Post)('rt/:rtId/warga'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN_RT, client_1.Role.SEKRETARIS_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Tambah warga baru langsung oleh Ketua RT / Sekretaris RT' }),
    __param(0, (0, common_1.Param)('rtId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "addWargaToRt", null);
__decorate([
    (0, common_1.Get)('rt/:rtId/pengurus'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar struktur pengurus RT aktif' }),
    __param(0, (0, common_1.Param)('rtId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "getPengurusByRt", null);
__decorate([
    (0, common_1.Post)('rt/:rtId/pengurus'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN_RT, client_1.Role.SEKRETARIS_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Tambah atau ubah jabatan pengurus RT (Khusus Ketua RT & Sekretaris RT)' }),
    __param(0, (0, common_1.Param)('rtId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "addOrUpdatePengurus", null);
__decorate([
    (0, common_1.Delete)('rt/:rtId/pengurus/:userId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN_RT, client_1.Role.SEKRETARIS_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus pengurus RT (Khusus Ketua RT & Sekretaris RT)' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WilayahController.prototype, "deletePengurus", null);
exports.WilayahController = WilayahController = __decorate([
    (0, swagger_1.ApiTags)('Wilayah (Hierarki Kelurahan, RW, RT & Manajemen Warga & Pengurus)'),
    (0, common_1.Controller)('api/wilayah'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [wilayah_service_1.WilayahService])
], WilayahController);
//# sourceMappingURL=wilayah.controller.js.map