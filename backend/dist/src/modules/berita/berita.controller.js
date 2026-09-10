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
exports.BeritaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const berita_service_1 = require("./berita.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let BeritaController = class BeritaController {
    constructor(beritaService) {
        this.beritaService = beritaService;
    }
    async getFeed(user) {
        return this.beritaService.getFeed(user);
    }
    async createBerita(user, body) {
        return this.beritaService.createBerita(user, body);
    }
    async updateBerita(id, user, body) {
        return this.beritaService.updateBerita(id, user, body);
    }
    async deleteBerita(id, user) {
        return this.beritaService.deleteBerita(id, user);
    }
};
exports.BeritaController = BeritaController;
__decorate([
    (0, common_1.Get)('feed'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan feed berita hierarkis (Otomatis menggabungkan berita RT, RW, dan Kelurahan)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BeritaController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Membuat berita baru (Sesuai scope RT / RW / Kelurahan)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BeritaController.prototype, "createBerita", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mengubah berita / pengumuman' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BeritaController.prototype, "updateBerita", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Menghapus berita / pengumuman' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BeritaController.prototype, "deleteBerita", null);
exports.BeritaController = BeritaController = __decorate([
    (0, swagger_1.ApiTags)('Berita & Pengumuman (Hierarkis RT, RW, Kelurahan)'),
    (0, common_1.Controller)('api/berita'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [berita_service_1.BeritaService])
], BeritaController);
//# sourceMappingURL=berita.controller.js.map