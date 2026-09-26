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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const duitku_service_1 = require("./duitku.service");
let PaymentController = class PaymentController {
    constructor(duitkuService) {
        this.duitkuService = duitkuService;
    }
    getGatewayInfo() {
        return this.duitkuService.getGatewayStatus();
    }
    getChannels() {
        return this.duitkuService.getPaymentChannels();
    }
    async createInvoice(userId, dto) {
        return this.duitkuService.createInvoice(userId, dto);
    }
    async handleDuitkuCallback(body) {
        return this.duitkuService.handleCallback(body);
    }
    async checkStatus(merchantOrderId) {
        return this.duitkuService.checkTransactionStatus(merchantOrderId);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Get)('gateway-info'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan status dan informasi integrasi Payment Gateway Duitku' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "getGatewayInfo", null);
__decorate([
    (0, common_1.Get)('channels'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan daftar saluran pembayaran aktif (QRIS & Virtual Accounts)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "getChannels", null);
__decorate([
    (0, common_1.Post)('create-invoice'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Menerbitkan Invoice Pembayaran Duitku untuk Tagihan Kas RT' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)('duitku/callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook Callback Notification dari Duitku' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleDuitkuCallback", null);
__decorate([
    (0, common_1.Get)('status/:merchantOrderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cek status pembayaran transaksi secara real-time ke Duitku' }),
    __param(0, (0, common_1.Param)('merchantOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "checkStatus", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payment Gateway (Duitku)'),
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [duitku_service_1.DuitkuService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map