import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusTagihan, PaymentStatus, PaymentMethod, TipeKas } from '@prisma/client';
import * as crypto from 'crypto';

export interface CreateInvoiceDto {
  tagihanId: string;
  paymentMethodCode?: string; // 'SP' (QRIS), 'BC' (BCA VA), 'M2' (Mandiri VA), 'BR' (BRI VA), 'I1' (BNI VA), etc.
}

@Injectable()
export class DuitkuService {
  private readonly logger = new Logger(DuitkuService.name);

  private readonly merchantCode: string;
  private readonly apiKey: string;
  private readonly env: string;
  private readonly callbackUrl: string;
  private readonly returnUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.merchantCode = this.config.get<string>('DUITKU_MERCHANT_CODE') || '';
    this.apiKey = this.config.get<string>('DUITKU_API_KEY') || '';
    this.env = (this.config.get<string>('DUITKU_ENV') || 'sandbox').toLowerCase();
    this.callbackUrl =
      this.config.get<string>('DUITKU_CALLBACK_URL') ||
      'https://api.rthub.id/api/payment/duitku/callback';
    this.returnUrl =
      this.config.get<string>('DUITKU_RETURN_URL') ||
      'https://rthub.id/payment-success';
  }

  private get baseUrl(): string {
    return this.env === 'production'
      ? 'https://passport.duitku.com/webapi/api'
      : 'https://sandbox.duitku.com/webapi/api';
  }

  public isConfigured(): boolean {
    return Boolean(this.merchantCode && this.apiKey);
  }

  /**
   * Mengambil konfigurasi status PG saat ini untuk dashboard superadmin
   */
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

  /**
   * Membuat transaksi / Invoice pembayaran iuran kas via Duitku
   */
  async createInvoice(userId: string, dto: CreateInvoiceDto) {
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
      throw new NotFoundException('Tagihan tidak ditemukan.');
    }

    if (tagihan.status === StatusTagihan.PAID) {
      throw new BadRequestException('Tagihan ini sudah lunas.');
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

    // Map payment method code
    const methodCode = dto.paymentMethodCode || 'SP'; // Default SP = ShopeePay / QRIS
    let prismaMethod: PaymentMethod = PaymentMethod.QRIS;
    if (methodCode === 'BC') prismaMethod = PaymentMethod.VA_BCA;
    else if (methodCode === 'M2') prismaMethod = PaymentMethod.VA_MANDIRI;
    else if (methodCode === 'BR') prismaMethod = PaymentMethod.VA_BRI;
    else if (methodCode === 'I1') prismaMethod = PaymentMethod.VA_BNI;

    // 1. Jika Duitku belum dikonfigurasi / Mode Simulasi Lokal
    if (!this.isConfigured()) {
      this.logger.warn(
        `[DUITKU] Kredensial DUITKU_MERCHANT_CODE atau DUITKU_API_KEY belum diisi di .env. Menggunakan sandbox simulation mode.`
      );

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
          status: PaymentStatus.PENDING,
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

    // 2. Real API Call to Duitku (/merchant/v2/inquiry)
    // Signature: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
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
      expiryPeriod: 1440, // 24 jam
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
        throw new BadRequestException(
          `Gagal membuat transaksi Duitku: ${result.statusMessage || result.statusCode || 'Respon tidak valid'}`
        );
      }

      // Simpan riwayat transaksi PENDING di database
      await this.prisma.transaksiPembayaran.create({
        data: {
          tagihanId: tagihan.id,
          userId,
          nominalPokok: tagihan.nominalPokok,
          adminFee: tagihan.adminFee,
          totalBayar: tagihan.totalBayar,
          paymentMethod: prismaMethod,
          status: PaymentStatus.PENDING,
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
    } catch (err: any) {
      this.logger.error(`[DUITKU ERROR] ${err.message}`, err.stack);
      throw new BadRequestException(`Gagal menghubungi gateway Duitku: ${err.message}`);
    }
  }

  /**
   * Handle Webhook Callback Notification dari Duitku
   */
  async handleCallback(body: any) {
    this.logger.log(`[DUITKU CALLBACK RECEIVED] ${JSON.stringify(body)}`);

    const {
      merchantCode,
      amount,
      merchantOrderId,
      signature,
      resultCode,
      reference,
      additionalParam,
    } = body;

    if (!merchantCode || !amount || !merchantOrderId || !signature) {
      throw new BadRequestException('Parameter callback Duitku tidak lengkap.');
    }

    // 1. Verifikasi Signature Duitku:
    // Signature: MD5(merchantCode + amount + merchantOrderId + apiKey)
    if (this.isConfigured()) {
      const expectedSig = crypto
        .createHash('md5')
        .update(`${merchantCode}${amount}${merchantOrderId}${this.apiKey}`)
        .digest('hex');

      if (expectedSig !== signature) {
        this.logger.error(`[DUITKU SIGNATURE MISMATCH] Received: ${signature}, Expected: ${expectedSig}`);
        throw new BadRequestException('Signature Duitku tidak valid.');
      }
    }

    // 2. Cek apakah pembayaran berhasil (resultCode == '00')
    if (resultCode !== '00') {
      this.logger.warn(`[DUITKU PAYMENT NOT SUCCESS] Order: ${merchantOrderId}, ResultCode: ${resultCode}`);
      return { status: 'IGNORED', message: 'Transaksi belum sukses / dibatalkan.' };
    }

    // 3. Cari data transaksi di database berdasarkan referenceId atau tagihanId
    let meta: any = {};
    try {
      if (additionalParam) meta = JSON.parse(additionalParam);
    } catch (_) {}

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
      // Cari tagihan langsung
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
            paymentMethod: PaymentMethod.QRIS,
            status: PaymentStatus.PENDING,
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
      throw new NotFoundException('Transaksi pembayaran tidak ditemukan.');
    }

    // Jika sudah lunas, tidak perlu proses ulang (Idempotent)
    if (transaksi.status === PaymentStatus.SUCCESS) {
      this.logger.log(`[DUITKU CALLBACK IDEMPOTENT] Transaksi ${transaksi.id} sudah berstatus SUCCESS.`);
      return { status: 'SUCCESS', message: 'Transaksi sudah lunas sebelumnya.' };
    }

    // 4. Eksekusi Settlement:
    // A. Update Transaksi -> SUCCESS
    await this.prisma.transaksiPembayaran.update({
      where: { id: transaksi.id },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        referenceId: reference || transaksi.referenceId,
      },
    });

    // B. Update Tagihan -> PAID
    await this.prisma.tagihanWarga.update({
      where: { id: transaksi.tagihanId },
      data: {
        status: StatusTagihan.PAID,
        paidAt: new Date(),
      },
    });

    // C. Catat Hak Platform (Rp 1.500) di SystemFeeLog
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

    // D. Catat Kas Masuk RT (Nominal Pokok Kas RT)
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
        tipe: TipeKas.PEMASUKAN,
        kategori: 'Iuran Warga (Duitku PG)',
        nominal: transaksi.nominalPokok,
        saldoBerjalan: newSaldo,
        keterangan: `Pembayaran ${transaksi.tagihan.masterTagihan.namaTagihan} Periode ${transaksi.tagihan.periodeBulan}/${transaksi.tagihan.periodeTahun} - Rumah ${transaksi.tagihan.rumah.noRumah} (Ref: ${reference || merchantOrderId})`,
      },
    });

    this.logger.log(
      `[DUITKU SETTLEMENT SUCCESS] Tagihan ${transaksi.tagihanId} lunas! Kas RT bertambah Rp ${transaksi.nominalPokok}, Fee Platform Rp ${transaksi.adminFee}`
    );

    return { status: 'SUCCESS', message: 'Callback Duitku berhasil diproses & dana kas RT telah dicatat.' };
  }

  /**
   * Cek Status Transaksi secara real-time ke Duitku
   */
  async checkTransactionStatus(merchantOrderId: string) {
    if (!this.isConfigured()) {
      return {
        merchantOrderId,
        statusCode: '00',
        statusMessage: 'SUCCESS (Simulation Mode)',
      };
    }

    // Signature: MD5(merchantCode + merchantOrderId + apiKey)
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
    } catch (err: any) {
      throw new BadRequestException(`Gagal cek status transaksi Duitku: ${err.message}`);
    }
  }

  /**
   * Daftar Saluran Pembayaran yang Tersedia
   */
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

  /**
   * Payout / Disbursement ke rekening bank bendahara RT (Penarikan Kas RT)
   */
  async createDisbursement(dto: {
    withdrawalId: string;
    bankCode: string;
    bankAccount: string;
    accountHolderName: string;
    amount: number;
    purpose: string;
  }) {
    if (!this.isConfigured()) {
      this.logger.log(
        `[DUITKU DISBURSEMENT SIMULATION] Transfer Rp ${dto.amount} ke ${dto.bankCode} ${dto.bankAccount} a/n ${dto.accountHolderName}`
      );
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
    } catch (err: any) {
      this.logger.error(`[DUITKU DISBURSEMENT ERROR] ${err.message}`, err.stack);
      return {
        success: false,
        isSimulation: false,
        status: 'FAILED',
        message: `Gagal memproses payout Duitku: ${err.message}`,
      };
    }
  }
}
