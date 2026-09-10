import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertService } from './alert.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Alert & Panic Button Darurat (Keamanan Lingkungan)')
@Controller('api/alert')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('panic')
  @ApiOperation({ summary: '🚨 Tekan Tombol Panik Darurat (Kirim sinyal bahaya ke Satpam & RT)' })
  async triggerPanic(
    @CurrentUser() user: any,
    @Body() body: { latitude?: number; longitude?: number; catatan?: string },
  ) {
    return this.alertService.triggerPanic(user, body);
  }

  @Get('active')
  @ApiOperation({ summary: 'Mendapatkan daftar alarm darurat yang sedang aktif di RT' })
  async getActive(@CurrentUser() user: any) {
    return this.alertService.getActiveAlerts(user.rtId);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Tandai alarm darurat selesai ditangani' })
  async resolve(@Param('id') id: string) {
    return this.alertService.resolveAlert(id);
  }
}
