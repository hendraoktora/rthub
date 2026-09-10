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
exports.CctvController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cctv_service_1 = require("./cctv.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let CctvController = class CctvController {
    constructor(cctvService) {
        this.cctvService = cctvService;
    }
    async getCctvList(user) {
        return this.cctvService.getCctvList(user);
    }
    async createCctv(user, body) {
        return this.cctvService.createCctv(user, body);
    }
    async deleteCctv(id, user) {
        return this.cctvService.deleteCctv(id, user);
    }
};
exports.CctvController = CctvController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan daftar live streaming CCTV di RT dan RW pengguna' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CctvController.prototype, "getCctvList", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN_RT, client_1.Role.SEKRETARIS_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Menambahkan titik live streaming CCTV baru (Khusus RT & Sekretaris)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CctvController.prototype, "createCctv", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN_RT, client_1.Role.SEKRETARIS_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Menghapus titik CCTV (Khusus RT & Sekretaris)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CctvController.prototype, "deleteCctv", null);
exports.CctvController = CctvController = __decorate([
    (0, swagger_1.ApiTags)('CCTV Lingkungan (Live Stream RT & RW)'),
    (0, common_1.Controller)('api/cctv'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [cctv_service_1.CctvService])
], CctvController);
//# sourceMappingURL=cctv.controller.js.map