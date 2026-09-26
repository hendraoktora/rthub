"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DuitkuService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuitkuService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let DuitkuService = DuitkuService_1 = class DuitkuService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.logger = new common_1.Logger(DuitkuService_1.name);
        this.merchantCode = this.config.get('DUITKU_MERCHANT_CODE') || '';
        this.apiKey = this.config.get('DUITKU_API_KEY') || '';
        this.env = (this.config.get('DUITKU_ENV') || 'sandbox').toLowerCase();
        this.callbackUrl =
            this.config.get('DUITKU_CALLBACK_URL') ||
                'https://api.rthub.id/api/payment/duitku/callback';
        this.returnUrl =
            this.config.get('DUITKU_RETURN_URL') ||
                'https://rthub.id/payment-success';
    }
    get baseUrl() {
        return this.env === 'production'
            ? 'https://passport.duitku.com/webapi/api'
            : 'https://sandbox.duitku.com/webapi/api';
    }
    isConfigured() {
        return Boolean(this.merchantCode && this.apiKey);
    }
    getGatewayStatus() {
        return {
            provider: 'Duitku',
            configured: this.isConfigured(),
            environment: this.env,
            merchantCode: this.merchantCode ? `${this.merchantCode.substring(0, 3)}***` : 'Belum diatur',
            callbackUrl: this.callbackUrl,
            returnUrl: this.returnUrl,
        };
    }
    async createInvoice(userId, dto) {
        const tagihan = await this.prisma.tagihanWarga.findUnique({
            where: { id: dto.tagihanId },
            include: {
                masterTagihan: true,
                rumah: {
                    include: {
                        rt: true,
                    },
                },
            },
        });
        if (!tagihan) {
            throw new common_1.NotFoundException('Tagihan tidak ditemukan.');
        }
        if (tagihan.status === client_1.StatusTagihan.PAID) {
            throw new common_1.BadRequestException('Tagihan ini sudah lunas.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        const nominalTotal = Math.round(Number(tagihan.totalBayar));
        const merchantOrderId = `INV-${tagihan.rumah.rt?.nomor || '03'}-${Date.now()}`;
        const productDetails = `Iuran ${tagihan.masterTagihan.namaTagihan} Periode ${tagihan.periodeBulan}/${tagihan.periodeTahun} - Rumah ${tagihan.rumah.noRumah}`;
        const customerName = user?.profile?.namaLengkap || 'Warga RT';
        const customerPhone = user?.phone || '081234567890';
        const customerEmail = user?.email || 'warga@rthub.id';
        const methodCode = dto.paymentMethodCode || 'SP';
        let prismaMethod = client_1.PaymentMethod.QRIS;
        if (methodCode === 'BC')
            prismaMethod = client_1.PaymentMethod.VA_BCA;
        else if (methodCode === 'M2')
            prismaMethod = client_1.PaymentMethod.VA_MANDIRI;
        else if (methodCode === 'BR')
            prismaMethod = client_1.PaymentMethod.VA_BRI;
        else if (methodCode === 'I1')
            prismaMethod = client_1.PaymentMethod.VA_BNI;
        if (!this.isConfigured()) {
            this.logger.warn(`[DUITKU] Kredensial DUITKU_MERCHANT_CODE atau DUITKU_API_KEY belum diisi di .env. Menggunakan sandbox simulation mode.`);
            const simVaNumber = `88708${customerPhone.replace(/\D/g, '').slice(-7).padStart(7, '0')}`;
            const simQrString = `00020101021226590014ID.LINKAJA.WWW01189360091100222718520215000000000000005303360540${nominalTotal}5802ID5908RTHUB_RT6007JAKARTA61051234062070703A016304D1B9`;
            const transaksi = await this.prisma.transaksiPembayaran.create({
                data: {
                    tagihanId: tagihan.id,
                    userId,
                    nominalPokok: tagihan.nominalPokok,
                    adminFee: tagihan.adminFee,
                    totalBayar: tagihan.totalBayar,
                    paymentMethod: prismaMethod,
                    status: client_1.PaymentStatus.PENDING,
                    paymentCode: methodCode.startsWith('V') || ['BC', 'M2', 'BR', 'I1'].includes(methodCode) ? simVaNumber : simQrString,
                    referenceId: `SIM-${merchantOrderId}`,
                },
            });
            return {
                success: true,
                isSimulation: true,
                merchantOrderId,
                reference: transaksi.referenceId,
                paymentUrl: `https://sandbox.duitku.com/checkout-sim?orderId=${merchantOrderId}&amount=${nominalTotal}`,
                vaNumber: simVaNumber,
                qrString: simQrString,
                amount: nominalTotal,
                paymentMethod: methodCode,
                statusCode: '00',
                message: 'Invoice tagihan berhasil dibuat (Mode Simulasi Duitku Sandbox). Silakan lakukan pembayaran.',
            };
        }
        const rawSig = `${this.merchantCode}${merchantOrderId}${nominalTotal}${this.apiKey}`;
        const signature = crypto.createHash('md5').update(rawSig).digest('hex');
        const payload = {
            merchantCode: this.merchantCode,
            paymentAmount: nominalTotal,
            paymentMethod: methodCode,
            merchantOrderId,
            productDetails,
            additionalParam: JSON.stringify({
                tagihanId: tagihan.id,
                userId,
                rtId: tagihan.rumah.rtId,
                nominalPokok: Number(tagihan.nominalPokok),
                adminFee: Number(tagihan.adminFee),
            }),
            merchantUserInfo: customerName,
            customerVaName: customerName,
            email: customerEmail,
            phoneNumber: customerPhone,
            itemDetails: [
                {
                    name: tagihan.masterTagihan.namaTagihan,
                    price: Number(tagihan.nominalPokok),
                    quantity: 1,
                },
                {
                    name: 'Biaya Layanan Platform RtHub',
                    price: Number(tagihan.adminFee),
                    quantity: 1,
                },
            ],
            customerDetail: {
                firstName: customerName,
                lastName: '',
                email: customerEmail,
                phoneNumber: customerPhone,
            },
            callbackUrl: this.callbackUrl,
            returnUrl: this.returnUrl,
            signature,
            expiryPeriod: 1440,
        };
        try {
            const response = await fetch(`${this.baseUrl}/merchant/v2/inquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            this.logger.log(`[DUITKU INQUIRY RESULT] OrderId: ${merchantOrderId} -> ${JSON.stringify(result)}`);
            if (result.statusCode !== '00') {
                throw new common_1.BadRequestException(`Gagal membuat transaksi Duitku: ${result.statusMessage || result.statusCode || 'Respon tidak valid'}`);
            }
            await this.prisma.transaksiPembayaran.create({
                data: {
                    tagihanId: tagihan.id,
                    userId,
                    nominalPokok: tagihan.nominalPokok,
                    adminFee: tagihan.adminFee,
                    totalBayar: tagihan.totalBayar,
                    paymentMethod: prismaMethod,
                    status: client_1.PaymentStatus.PENDING,
                    paymentCode: result.vaNumber || result.qrString || '',
                    referenceId: result.reference || merchantOrderId,
                },
            });
            return {
                success: true,
                isSimulation: false,
                merchantOrderId,
                reference: result.reference,
                paymentUrl: result.paymentUrl,
                vaNumber: result.vaNumber,
                qrString: result.qrString,
                amount: nominalTotal,
                paymentMethod: methodCode,
                statusCode: result.statusCode,
                message: 'Invoice Duitku berhasil diterbitkan. Silakan selesaikan pembayaran.',
            };
        }
        catch (err) {
            this.logger.error(`[DUITKU ERROR] ${err.message}`, err.stack);
            throw new common_1.BadRequestException(`Gagal menghubungi gateway Duitku: ${err.message}`);
        }
    }
    async handleCallback(body) {
        this.logger.log(`[DUITKU CALLBACK RECEIVED] ${JSON.stringify(body)}`);
        const { merchantCode, amount, merchantOrderId, signature, resultCode, reference, additionalParam, } = body;
        if (!merchantCode || !amount || !merchantOrderId || !signature) {
            throw new common_1.BadRequestException('Parameter callback Duitku tidak lengkap.');
        }
        if (this.isConfigured()) {
            const expectedSig = crypto
                .createHash('md5')
                .update(`${merchantCode}${amount}${merchantOrderId}${this.apiKey}`)
                .digest('hex');
            if (expectedSig !== signature) {
                this.logger.error(`[DUITKU SIGNATURE MISMATCH] Received: ${signature}, Expected: ${expectedSig}`);
                throw new common_1.BadRequestException('Signature Duitku tidak valid.');
            }
        }
        if (resultCode !== '00') {
            this.logger.warn(`[DUITKU PAYMENT NOT SUCCESS] Order: ${merchantOrderId}, ResultCode: ${resultCode}`);
            return { status: 'IGNORED', message: 'Transaksi belum sukses / dibatalkan.' };
        }
        let meta = {};
        try {
            if (additionalParam)
                meta = JSON.parse(additionalParam);
        }
        catch (_) { }
        const tagihanId = meta.tagihanId;
        let transaksi = await this.prisma.transaksiPembayaran.findFirst({
            where: {
                OR: [
                    { referenceId: reference },
                    { referenceId: `SIM-${merchantOrderId}` },
                    ...(tagihanId ? [{ tagihanId }] : []),
                ],
            },
            include: {
                tagihan: {
                    include: {
                        masterTagihan: true,
                        rumah: true,
                    },
                },
            },
        });
        if (!transaksi && tagihanId) {
            const tagihan = await this.prisma.tagihanWarga.findUnique({
                where: { id: tagihanId },
                include: { masterTagihan: true, rumah: true },
            });
            if (tagihan) {
                transaksi = await this.prisma.transaksiPembayaran.create({
                    data: {
                        tagihanId: tagihan.id,
                        userId: meta.userId || 'system-pg',
                        nominalPokok: tagihan.nominalPokok,
                        adminFee: tagihan.adminFee,
                        totalBayar: tagihan.totalBayar,
                        paymentMethod: client_1.PaymentMethod.QRIS,
                        status: client_1.PaymentStatus.PENDING,
                        referenceId: reference || merchantOrderId,
                    },
                    include: {
                        tagihan: {
                            include: { masterTagihan: true, rumah: true },
                        },
                    },
                });
            }
        }
        if (!transaksi) {
            this.logger.error(`[DUITKU CALLBACK ERROR] Tagihan/Transaksi tidak ditemukan untuk order ${merchantOrderId}`);
            throw new common_1.NotFoundException('Transaksi pembayaran tidak ditemukan.');
        }
        if (transaksi.status === client_1.PaymentStatus.SUCCESS) {
            this.logger.log(`[DUITKU CALLBACK IDEMPOTENT] Transaksi ${transaksi.id} sudah berstatus SUCCESS.`);
            return { status: 'SUCCESS', message: 'Transaksi sudah lunas sebelumnya.' };
        }
        await this.prisma.transaksiPembayaran.update({
            where: { id: transaksi.id },
            data: {
                status: client_1.PaymentStatus.SUCCESS,
                paidAt: new Date(),
                referenceId: reference || transaksi.referenceId,
            },
        });
        await this.prisma.tagihanWarga.update({
            where: { id: transaksi.tagihanId },
            data: {
                status: client_1.StatusTagihan.PAID,
                paidAt: new Date(),
            },
        });
        const existingFee = await this.prisma.systemFeeLog.findUnique({
            where: { transaksiId: transaksi.id },
        });
        if (!existingFee) {
            await this.prisma.systemFeeLog.create({
                data: {
                    transaksiId: transaksi.id,
                    rtId: transaksi.tagihan.rumah.rtId,
                    nominalFee: transaksi.adminFee,
                    isSettled: false,
                },
            });
        }
        const currentKas = await this.prisma.kasRT.findFirst({
            where: { rtId: transaksi.tagihan.rumah.rtId },
            orderBy: { createdAt: 'desc' },
        });
        const currentSaldo = currentKas ? Number(currentKas.saldoBerjalan) : 0;
        const newSaldo = currentSaldo + Number(transaksi.nominalPokok);
        await this.prisma.kasRT.create({
            data: {
                rtId: transaksi.tagihan.rumah.rtId,
                createdById: transaksi.userId,
                tipe: client_1.TipeKas.PEMASUKAN,
                kategori: 'Iuran Warga (Duitku PG)',
                nominal: transaksi.nominalPokok,
                saldoBerjalan: newSaldo,
                keterangan: `Pembayaran ${transaksi.tagihan.masterTagihan.namaTagihan} Periode ${transaksi.tagihan.periodeBulan}/${transaksi.tagihan.periodeTahun} - Rumah ${transaksi.tagihan.rumah.noRumah} (Ref: ${reference || merchantOrderId})`,
            },
        });
        this.logger.log(`[DUITKU SETTLEMENT SUCCESS] Tagihan ${transaksi.tagihanId} lunas! Kas RT bertambah Rp ${transaksi.nominalPokok}, Fee Platform Rp ${transaksi.adminFee}`);
        return { status: 'SUCCESS', message: 'Callback Duitku berhasil diproses & dana kas RT telah dicatat.' };
    }
    async checkTransactionStatus(merchantOrderId) {
        if (!this.isConfigured()) {
            return {
                merchantOrderId,
                statusCode: '00',
                statusMessage: 'SUCCESS (Simulation Mode)',
            };
        }
        const rawSig = `${this.merchantCode}${merchantOrderId}${this.apiKey}`;
        const signature = crypto.createHash('md5').update(rawSig).digest('hex');
        const payload = {
            merchantCode: this.merchantCode,
            merchantOrderId,
            signature,
        };
        try {
            const response = await fetch(`${this.baseUrl}/merchant/transactionStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            return await response.json();
        }
        catch (err) {
            throw new common_1.BadRequestException(`Gagal cek status transaksi Duitku: ${err.message}`);
        }
    }
    async getPaymentChannels() {
        return [
            {
                code: 'SP',
                name: 'QRIS (Semua E-Wallet & Mobile Banking)',
                category: 'QRIS',
                icon: 'https://images.duitku.com/icon/qris.png',
                feeType: 'PERCENTAGE',
                fee: '0.7%',
                desc: 'GoPay, OVO, Dana, ShopeePay, LinkAja, BCA Mobile, Livin, BRImo, dll',
            },
            {
                code: 'BC',
                name: 'BCA Virtual Account',
                category: 'VIRTUAL_ACCOUNT',
                icon: 'https://images.duitku.com/icon/bca.png',
                feeType: 'FIXED',
                fee: 'Rp 2.000',
                desc: 'Transfer via ATM, KlikBCA, m-BCA tanpa konfirmasi',
            },
            {
                code: 'M2',
                name: 'Mandiri Virtual Account',
                category: 'VIRTUAL_ACCOUNT',
                icon: 'https://images.duitku.com/icon/mandiri.png',
                feeType: 'FIXED',
                fee: 'Rp 2.000',
                desc: 'Transfer via Livin by Mandiri & ATM Mandiri',
            },
            {
                code: 'BR',
                name: 'BRI Virtual Account (BRIVA)',
                category: 'VIRTUAL_ACCOUNT',
                icon: 'https://images.duitku.com/icon/bri.png',
                feeType: 'FIXED',
                fee: 'Rp 2.000',
                desc: 'Transfer via BRImo & ATM BRI',
            },
            {
                code: 'I1',
                name: 'BNI Virtual Account',
                category: 'VIRTUAL_ACCOUNT',
                icon: 'https://images.duitku.com/icon/bni.png',
                feeType: 'FIXED',
                fee: 'Rp 2.000',
                desc: 'Transfer via BNI Mobile Banking & ATM BNI',
            },
            {
                code: 'BT',
                name: 'Permata Virtual Account',
                category: 'VIRTUAL_ACCOUNT',
                icon: 'https://images.duitku.com/icon/permata.png',
                feeType: 'FIXED',
                fee: 'Rp 2.000',
                desc: 'Transfer via PermataMobile & Jaringan ATM Bersama',
            },
        ];
    }
    async createDisbursement(dto) {
        if (!this.isConfigured()) {
            this.logger.log(`[DUITKU DISBURSEMENT SIMULATION] Transfer Rp ${dto.amount} ke ${dto.bankCode} ${dto.bankAccount} a/n ${dto.accountHolderName}`);
            return {
                success: true,
                isSimulation: true,
                disbursementRef: `SIM-DISB-${Date.now()}`,
                status: 'SUCCESS',
                message: 'Pencairan dana kas disimulasikan berhasil (Mode Sandbox).',
            };
        }
        const rawSignature = `${this.merchantCode}${dto.amount}${dto.bankAccount}${this.apiKey}`;
        const signature = crypto.createHash('sha256').update(rawSignature).digest('hex');
        const payload = {
            merchantCode: this.merchantCode,
            amount: dto.amount,
            bankCode: dto.bankCode,
            bankAccount: dto.bankAccount,
            custRefNumber: dto.withdrawalId,
            purpose: dto.purpose,
            senderId: this.merchantCode,
            signature,
        };
        try {
            const response = await fetch(`${this.baseUrl}/disbursement/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-DUITKU-MERCHANT-CODE': this.merchantCode,
                },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            this.logger.log(`[DUITKU DISBURSEMENT RESPONSE] -> ${JSON.stringify(result)}`);
            return {
                success: result.responseCode === '00' || result.statusCode === '00',
                disbursementRef: result.reference || result.disburseId || dto.withdrawalId,
                status: (result.responseCode === '00' || result.statusCode === '00') ? 'SUCCESS' : 'PENDING',
                message: result.responseMessage || result.statusMessage || 'Instruksi transfer dana diproses Duitku.',
                raw: result,
            };
        }
        catch (err) {
            this.logger.error(`[DUITKU DISBURSEMENT ERROR] ${err.message}`, err.stack);
            return {
                success: false,
                isSimulation: false,
                status: 'FAILED',
                message: `Gagal memproses payout Duitku: ${err.message}`,
            };
        }
    }
};
exports.DuitkuService = DuitkuService;
exports.DuitkuService = DuitkuService = DuitkuService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], DuitkuService);
//# sourceMappingURL=duitku.service.js.map