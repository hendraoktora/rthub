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
exports.GempaController = void 0;
const common_1 = require("@nestjs/common");
const gempa_service_1 = require("./gempa.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let GempaController = class GempaController {
    constructor(gempaService) {
        this.gempaService = gempaService;
    }
    async getTerkini() {
        const data = await this.gempaService.getGempaTerkini();
        return {
            status: 'success',
            data,
        };
    }
    async broadcast(req, body) {
        return this.gempaService.broadcastGempa(req.user, body);
    }
};
exports.GempaController = GempaController;
__decorate([
    (0, common_1.Get)('terkini'),
    (0, swagger_1.ApiOperation)({ summary: 'Dapatkan informasi gempa bumi terkini dari BMKG (real-time/cached)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GempaController.prototype, "getTerkini", null);
__decorate([
    (0, common_1.Post)('broadcast'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Broadcast peringatan gempa ke seluruh HP warga via push notification' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GempaController.prototype, "broadcast", null);
exports.GempaController = GempaController = __decorate([
    (0, swagger_1.ApiTags)('Gempa BMKG'),
    (0, common_1.Controller)('gempa'),
    __metadata("design:paramtypes", [gempa_service_1.GempaService])
], GempaController);
//# sourceMappingURL=gempa.controller.js.map