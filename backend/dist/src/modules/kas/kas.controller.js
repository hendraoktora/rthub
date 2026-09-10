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
exports.KasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const kas_service_1 = require("./kas.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let KasController = class KasController {
    constructor(kasService) {
        this.kasService = kasService;
    }
    async getSummary(user) {
        return this.kasService.getKasSummary(user.rtId);
    }
    async createKas(user, body) {
        return this.kasService.createKasEntry(user.rtId, user.id, body);
    }
    async createKasAlias(user, body) {
        return this.kasService.createKasEntry(user.rtId, user.id, body);
    }
};
exports.KasController = KasController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan ringkasan saldo kas, pemasukan, pengeluaran & mutasi RT' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KasController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.BENDAHARA_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mencatat transaksi kas / set saldo awal (Khusus Bendahara RT)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KasController.prototype, "createKas", null);
__decorate([
    (0, common_1.Post)('catat'),
    (0, roles_decorator_1.Roles)(client_1.Role.BENDAHARA_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mencatat transaksi kas masuk atau keluar (Khusus Bendahara RT)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KasController.prototype, "createKasAlias", null);
exports.KasController = KasController = __decorate([
    (0, swagger_1.ApiTags)('Kas RT (Pembukuan & Saldo Lingkungan)'),
    (0, common_1.Controller)('api/kas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [kas_service_1.KasService])
], KasController);
//# sourceMappingURL=kas.controller.js.map