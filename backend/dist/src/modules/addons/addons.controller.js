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
exports.AddonsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const addons_service_1 = require("./addons.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let AddonsController = class AddonsController {
    constructor(addonsService) {
        this.addonsService = addonsService;
    }
    async getMyRtAddonStatus(user) {
        const rtId = user?.rtId;
        if (!rtId) {
            return {
                rtId: null,
                paket: 'BASIC',
                status: 'TIDAK_AKTIF',
                isPro: false,
                message: 'Pengguna belum terhubung dengan unit RT manapun.',
            };
        }
        const sub = await this.addonsService.getRtSubscription(rtId);
        const isPro = await this.addonsService.isRtProActive(rtId);
        return {
            ...sub,
            isPro,
        };
    }
    async getRtAddonStatus(rtId) {
        const sub = await this.addonsService.getRtSubscription(rtId);
        const isPro = await this.addonsService.isRtProActive(rtId);
        return {
            ...sub,
            isPro,
        };
    }
    async getAllRtSubscriptions() {
        return this.addonsService.getAllRtSubscriptions();
    }
    async updateSubscription(user, body) {
        return this.addonsService.updateSubscription(body.rtId, {
            ...body,
            updatedBy: user.phone || user.id,
        });
    }
};
exports.AddonsController = AddonsController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cek status langganan Add-Ons RT saya (Mobile & Web)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddonsController.prototype, "getMyRtAddonStatus", null);
__decorate([
    (0, common_1.Get)('rt/:rtId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cek status langganan Add-Ons RT spesifik' }),
    __param(0, (0, common_1.Param)('rtId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AddonsController.prototype, "getRtAddonStatus", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar seluruh status langganan Add-Ons RT di sistem (Superadmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AddonsController.prototype, "getAllRtSubscriptions", null);
__decorate([
    (0, common_1.Post)('update'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Superadmin mengaktifkan / memperpanjang paket Pro Add-Ons RT' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AddonsController.prototype, "updateSubscription", null);
exports.AddonsController = AddonsController = __decorate([
    (0, swagger_1.ApiTags)('Paket Add-Ons Ekosistem RT'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/addons'),
    __metadata("design:paramtypes", [addons_service_1.AddonsService])
], AddonsController);
//# sourceMappingURL=addons.controller.js.map