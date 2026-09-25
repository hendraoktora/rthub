import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddonsService } from './addons.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Paket Add-Ons Ekosistem RT')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/addons')
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Cek status langganan Add-Ons RT saya (Mobile & Web)' })
  async getMyRtAddonStatus(@CurrentUser() user: any) {
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

  @Get('rt/:rtId')
  @ApiOperation({ summary: 'Cek status langganan Add-Ons RT spesifik' })
  async getRtAddonStatus(@Param('rtId') rtId: string) {
    const sub = await this.addonsService.getRtSubscription(rtId);
    const isPro = await this.addonsService.isRtProActive(rtId);
    return {
      ...sub,
      isPro,
    };
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Daftar seluruh status langganan Add-Ons RT di sistem (Superadmin)' })
  async getAllRtSubscriptions() {
    return this.addonsService.getAllRtSubscriptions();
  }

  @Post('update')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Superadmin mengaktifkan / memperpanjang paket Pro Add-Ons RT' })
  async updateSubscription(
    @CurrentUser() user: any,
    @Body()
    body: {
      rtId: string;
      status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF';
      durationDays?: number;
      paket?: 'BASIC' | 'PRO';
    },
  ) {
    return this.addonsService.updateSubscription(body.rtId, {
      ...body,
      updatedBy: user.phone || user.id,
    });
  }
}
