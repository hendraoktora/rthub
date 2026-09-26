import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DuitkuService, CreateInvoiceDto } from './duitku.service';

@ApiTags('Payment Gateway (Duitku)')
@Controller('payment')
export class PaymentController {
  constructor(private readonly duitkuService: DuitkuService) {}

  @Get('gateway-info')
  @ApiOperation({ summary: 'Mendapatkan status dan informasi integrasi Payment Gateway Duitku' })
  getGatewayInfo() {
    return this.duitkuService.getGatewayStatus();
  }

  @Get('channels')
  @ApiOperation({ summary: 'Mendapatkan daftar saluran pembayaran aktif (QRIS & Virtual Accounts)' })
  getChannels() {
    return this.duitkuService.getPaymentChannels();
  }

  @Post('create-invoice')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menerbitkan Invoice Pembayaran Duitku untuk Tagihan Kas RT' })
  async createInvoice(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.duitkuService.createInvoice(userId, dto);
  }

  @Post('duitku/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Callback Notification dari Duitku' })
  async handleDuitkuCallback(@Body() body: any) {
    return this.duitkuService.handleCallback(body);
  }

  @Get('status/:merchantOrderId')
  @ApiOperation({ summary: 'Cek status pembayaran transaksi secara real-time ke Duitku' })
  async checkStatus(@Param('merchantOrderId') merchantOrderId: string) {
    return this.duitkuService.checkTransactionStatus(merchantOrderId);
  }
}
