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
exports.TagihanController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tagihan_service_1 = require("./tagihan.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let TagihanController = class TagihanController {
    constructor(tagihanService) {
        this.tagihanService = tagihanService;
    }
    async getMaster(user) {
        return this.tagihanService.getMasterTagihan(user.rtId);
    }
    async setMaster(user, body) {
        return this.tagihanService.setMasterTagihan(user.rtId, body);
    }
    async generateBulanan(user, body) {
        return this.tagihanService.generateTagihanBulanan(user.rtId, body.masterTagihanId, body.bulan, body.tahun);
    }
    async getTagihanSaya(user) {
        return this.tagihanService.getTagihanSaya(user);
    }
    async bayar(id, user, body) {
        return this.tagihanService.bayarTagihan(id, user.id, body.paymentMethod || client_1.PaymentMethod.QRIS);
    }
};
exports.TagihanController = TagihanController;
__decorate([
    (0, common_1.Get)('master'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan daftar master tagihan di RT pengguna' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagihanController.prototype, "getMaster", null);
__decorate([
    (0, common_1.Post)('master'),
    (0, roles_decorator_1.Roles)(client_1.Role.BENDAHARA_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Atur / Ubah nominal tarif iuran bulanan RT (Khusus Bendahara RT)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TagihanController.prototype, "setMaster", null);
__decorate([
    (0, common_1.Post)('generate-bulanan'),
    (0, roles_decorator_1.Roles)(client_1.Role.BENDAHARA_RT, client_1.Role.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Menerbitkan tagihan iuran bulanan massal ke seluruh rumah di RT (Khusus Bendahara RT)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TagihanController.prototype, "generateBulanan", null);
__decorate([
    (0, common_1.Get)('saya'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan riwayat dan tagihan aktif rumah pengguna' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagihanController.prototype, "getTagihanSaya", null);
__decorate([
    (0, common_1.Post)(':id/bayar'),
    (0, swagger_1.ApiOperation)({ summary: 'Bayar tagihan iuran (Split otomatis: Kas RT + Fee Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TagihanController.prototype, "bayar", null);
exports.TagihanController = TagihanController = __decorate([
    (0, swagger_1.ApiTags)('Tagihan & Pembayaran (IPL, Kas & Fee Admin)'),
    (0, common_1.Controller)('api/tagihan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [tagihan_service_1.TagihanService])
], TagihanController);
//# sourceMappingURL=tagihan.controller.js.map